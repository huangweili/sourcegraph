package resolvers

import (
	"context"
	"encoding/base64"

	graphql "github.com/graph-gophers/graphql-go"
	"github.com/pkg/errors"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/backend"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/graphqlbackend"
	codeintelapi "github.com/sourcegraph/sourcegraph/internal/codeintel/api"
	bundles "github.com/sourcegraph/sourcegraph/internal/codeintel/bundles/client"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/db"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/gitserver"
)

type Resolver struct {
	db                  db.DB
	bundleManagerClient bundles.BundleManagerClient
	codeIntelAPI        codeintelapi.CodeIntelAPI
}

var _ graphqlbackend.CodeIntelResolver = &Resolver{}

func NewResolver(db db.DB, bundleManagerClient bundles.BundleManagerClient, codeIntelAPI codeintelapi.CodeIntelAPI) graphqlbackend.CodeIntelResolver {
	return &Resolver{
		db:                  db,
		bundleManagerClient: bundleManagerClient,
		codeIntelAPI:        codeIntelAPI,
	}
}

func (r *Resolver) LSIFUploadByID(ctx context.Context, id graphql.ID) (graphqlbackend.LSIFUploadResolver, error) {
	uploadID, err := unmarshalLSIFUploadGQLID(id)
	if err != nil {
		return nil, err
	}

	upload, exists, err := r.db.GetUploadByID(ctx, int(uploadID))
	if err != nil || !exists {
		return nil, err
	}

	return &lsifUploadResolver{lsifUpload: upload}, nil
}

func (r *Resolver) LSIFUploads(ctx context.Context, args *graphqlbackend.LSIFUploadsQueryArgs) (graphqlbackend.LSIFUploadConnectionResolver, error) {
	return r.LSIFUploadsByRepo(ctx, &graphqlbackend.LSIFRepositoryUploadsQueryArgs{
		LSIFUploadsQueryArgs: args,
	})
}

func (r *Resolver) LSIFUploadsByRepo(ctx context.Context, args *graphqlbackend.LSIFRepositoryUploadsQueryArgs) (graphqlbackend.LSIFUploadConnectionResolver, error) {
	opt := LSIFUploadsListOptions{
		RepositoryID:    args.RepositoryID,
		Query:           args.Query,
		State:           args.State,
		IsLatestForRepo: args.IsLatestForRepo,
	}
	if args.First != nil {
		opt.Limit = args.First
	}
	if args.After != nil {
		decoded, err := base64.StdEncoding.DecodeString(*args.After)
		if err != nil {
			return nil, err
		}
		nextURL := string(decoded)
		opt.NextURL = &nextURL
	}

	return &lsifUploadConnectionResolver{db: r.db, opt: opt}, nil
}

func (r *Resolver) DeleteLSIFUpload(ctx context.Context, id graphql.ID) (*graphqlbackend.EmptyResponse, error) {
	// 🚨 SECURITY: Only site admins may delete LSIF data for now
	if err := backend.CheckCurrentUserIsSiteAdmin(ctx); err != nil {
		return nil, err
	}

	uploadID, err := unmarshalLSIFUploadGQLID(id)
	if err != nil {
		return nil, err
	}

	_, err = r.db.DeleteUploadByID(ctx, int(uploadID), func(repositoryID int) (string, error) {
		tipCommit, err := gitserver.Head(ctx, r.db, repositoryID)
		if err != nil {
			return "", errors.Wrap(err, "gitserver.Head")
		}
		return tipCommit, nil
	})
	if err != nil {
		return nil, err
	}

	return &graphqlbackend.EmptyResponse{}, nil
}

func (r *Resolver) LSIFIndexByID(ctx context.Context, id graphql.ID) (graphqlbackend.LSIFIndexResolver, error) {
	indexID, err := unmarshalLSIFIndexGQLID(id)
	if err != nil {
		return nil, err
	}

	index, exists, err := r.db.GetIndexByID(ctx, int(indexID))
	if err != nil || !exists {
		return nil, err
	}

	return &lsifIndexResolver{lsifIndex: index}, nil
}

func (r *Resolver) LSIFIndexes(ctx context.Context, args *graphqlbackend.LSIFIndexesQueryArgs) (graphqlbackend.LSIFIndexConnectionResolver, error) {
	return r.LSIFIndexesByRepo(ctx, &graphqlbackend.LSIFRepositoryIndexesQueryArgs{
		LSIFIndexesQueryArgs: args,
	})
}

func (r *Resolver) LSIFIndexesByRepo(ctx context.Context, args *graphqlbackend.LSIFRepositoryIndexesQueryArgs) (graphqlbackend.LSIFIndexConnectionResolver, error) {
	opt := LSIFIndexesListOptions{
		RepositoryID: args.RepositoryID,
		Query:        args.Query,
		State:        args.State,
	}
	if args.First != nil {
		opt.Limit = args.First
	}
	if args.After != nil {
		decoded, err := base64.StdEncoding.DecodeString(*args.After)
		if err != nil {
			return nil, err
		}
		nextURL := string(decoded)
		opt.NextURL = &nextURL
	}

	return &lsifIndexConnectionResolver{db: r.db, opt: opt}, nil
}

func (r *Resolver) DeleteLSIFIndex(ctx context.Context, id graphql.ID) (*graphqlbackend.EmptyResponse, error) {
	// 🚨 SECURITY: Only site admins may delete LSIF data for now
	if err := backend.CheckCurrentUserIsSiteAdmin(ctx); err != nil {
		return nil, err
	}

	indexID, err := unmarshalLSIFIndexGQLID(id)
	if err != nil {
		return nil, err
	}

	if _, err := r.db.DeleteIndexByID(ctx, int(indexID)); err != nil {
		return nil, err
	}

	return &graphqlbackend.EmptyResponse{}, nil
}

func (r *Resolver) GitBlobLSIFData(ctx context.Context, args *graphqlbackend.GitBlobLSIFDataArgs) (graphqlbackend.GitBlobLSIFDataResolver, error) {
	dumps, err := r.codeIntelAPI.FindClosestDumps(ctx, int(args.Repository.Type().ID), string(args.Commit), args.Path, args.Indexer)
	if err != nil {
		return nil, err
	}
	if len(dumps) == 0 {
		return nil, nil
	}

	return &lsifQueryResolver{
		db:                  r.db,
		bundleManagerClient: r.bundleManagerClient,
		codeIntelAPI:        r.codeIntelAPI,
		repositoryResolver:  args.Repository,
		commit:              args.Commit,
		path:                args.Path,
		uploads:             dumps,
	}, nil
}
