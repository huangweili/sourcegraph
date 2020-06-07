import React, { useMemo, useCallback } from 'react'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { PageTitle } from '../../../components/PageTitle'
import { UserAvatar } from '../../../user/UserAvatar'
import { Timestamp } from '../../../components/time/Timestamp'
import {
    queryPatchesFromCampaign,
    queryPatchesFromPatchSet,
    queryChangesets,
    queryPatchFileDiffs,
    fetchPatchSetById,
} from './backend'
import * as H from 'history'
import { CampaignBurndownChart } from './BurndownChart'
import { AddChangesetForm } from './AddChangesetForm'
import { Subject, NEVER, Observable } from 'rxjs'
import { renderMarkdown } from '../../../../../shared/src/util/markdown'
import { Markdown } from '../../../../../shared/src/components/Markdown'
import { ThemeProps } from '../../../../../shared/src/theme'
import { CampaignStatus } from './CampaignStatus'
import { CampaignChangesets } from './changesets/CampaignChangesets'
import { CampaignDiffStat } from './CampaignDiffStat'
import { pluralize } from '../../../../../shared/src/util/strings'
import { ExtensionsControllerProps } from '../../../../../shared/src/extensions/controller'
import { PlatformContextProps } from '../../../../../shared/src/platform/context'
import { TelemetryProps } from '../../../../../shared/src/telemetry/telemetryService'
import { CampaignPatches } from './patches/CampaignPatches'
import { PatchSetPatches } from './patches/PatchSetPatches'
import { MinimalCampaign, MinimalPatchSet } from './CampaignArea'
import { useObservable } from '../../../../../shared/src/util/useObservable'
import { CampaignDescription } from './CampaignDescription'
import { CampaignInfoBar } from './CampaignInfoBar'
import { Timeline } from '../../../components/timeline/Timeline'
import { Link } from 'react-router-dom'
import { CampaignChangesetsEditButton } from './changesets/CampaignChangesetsEditButton'
import { CampaignChangesetsAddExistingButton } from './changesets/CampaignChangesetsAddExistingButton'
import { CampaignChangesets2 } from './changesets/CampaignChangesets2'
import { CampaignsIcon } from '../icons'
import { ChangesetStateIcon } from './changesets/ChangesetStateIcon'
import { changesetStateIcons } from './changesets/presentation'
import SourcePullIcon from 'mdi-react/SourcePullIcon'
import SourceMergeIcon from 'mdi-react/SourceMergeIcon'
import ProgressCheckIcon from 'mdi-react/ProgressCheckIcon'

export type CampaignUIMode = 'viewing' | 'deleting' | 'closing'

interface Props extends ThemeProps, ExtensionsControllerProps, PlatformContextProps, TelemetryProps {
    campaign: MinimalCampaign
    history: H.History
    location: H.Location

    fetchPatchSetById: typeof fetchPatchSetById | ((patchSet: GQL.ID) => Observable<MinimalPatchSet | null>)
    queryPatchesFromCampaign: typeof queryPatchesFromCampaign
    queryPatchesFromPatchSet: typeof queryPatchesFromPatchSet
    queryPatchFileDiffs: typeof queryPatchFileDiffs
    queryChangesets: typeof queryChangesets
    _noSubject?: boolean
}

/**
 * The area for a single campaign.
 */
export const CampaignDetails: React.FunctionComponent<Props> = ({
    campaign,
    history,
    location,
    isLightTheme,
    extensionsController,
    platformContext,
    telemetryService,
    fetchPatchSetById,
    queryPatchesFromCampaign,
    queryPatchesFromPatchSet,
    queryPatchFileDiffs,
    queryChangesets,
}) => {
    /** Retrigger campaign fetching */
    const campaignUpdates = useMemo(() => new Subject<void>(), [])
    /** Retrigger changeset fetching */
    const changesetUpdates = useMemo(() => new Subject<void>(), [])

    const onAddChangeset = useCallback((): void => {
        // we also check the campaign.changesets.totalCount, so an update to the campaign is required as well
        campaignUpdates.next()
        changesetUpdates.next()
    }, [campaignUpdates, changesetUpdates])

    // TODO(sqs)
    const afterRetry = useCallback(() => {
        /* noop */
    }, [])

    const patchSet = useObservable(
        useMemo(() => (campaign.patchSet?.id ? fetchPatchSetById(campaign.patchSet.id) : NEVER), [
            campaign.patchSet,
            fetchPatchSetById,
        ])
    )

    const totalChangesetCount = campaign?.changesets.totalCount ?? 0

    const totalPatchCount = (campaign?.patches.totalCount ?? 0) + (patchSet?.patches.totalCount ?? 0)

    // TODO(sqs): add retry

    return (
        <>
            <PageTitle title={campaign.name} />
            <div className="container">
                <header>
                    <h1 className="mb-1">{campaign.name}</h1>
                    <CampaignInfoBar campaign={campaign} />
                </header>
                <Timeline className="mt-3">
                    <CampaignDescription campaign={campaign} history={history} className="w-100" />
                    <div className="card mt-3 w-100">
                        <div className="card-body d-flex align-items-center">
                            <ProgressCheckIcon className="h3 mb-0 mr-2 icon-inline text-muted" />
                            <strong className="mr-3">50% complete</strong>
                            <span className="text-muted mr-2">8 changesets total</span>
                            <div className="d-flex align-items-center flex-1">
                                <span className="border2 p-2 mr-2">
                                    <SourcePullIcon className="icon-inline text-muted" /> 2 unpublished
                                </span>
                                <span className="border2 p-2 mr-2">
                                    <SourcePullIcon className="icon-inline text-success" /> 2 open
                                </span>
                                <span className="border2 p-2 mr-2">
                                    <SourceMergeIcon className="icon-inline text-merged" /> 2 merged
                                </span>
                                <span className="border2 p-2 mr-2">
                                    <SourcePullIcon className="icon-inline text-danger" /> 2 closed
                                </span>
                                <div className="flex-1" />
                                <Link to="#TODO(sqs)" className="btn btn-link ml-3 mr-2 border">
                                    Burndown chart
                                </Link>
                                <Link to="#changesets" className="btn btn-link border">
                                    All changesets
                                </Link>
                            </div>
                        </div>
                        <footer className="card-footer small text-muted">
                            To add a changeset to this campaign,{' '}
                            <CampaignChangesetsEditButton campaign={campaign} buttonClassName="font-weight-bold">
                                update the patches
                            </CampaignChangesetsEditButton>{' '}
                            or{' '}
                            <CampaignChangesetsAddExistingButton
                                campaign={campaign}
                                buttonClassName="font-weight-bold"
                                history={history}
                            >
                                track an existing changeset
                            </CampaignChangesetsAddExistingButton>
                            .
                        </footer>
                    </div>
                    <div className="card mt-3 w-100">
                        <div className="card-body d-flex">
                            <CampaignsIcon className="h3 mb-0 mr-2 icon-inline text-muted" />
                            <div className="d-flex align-items-center flex-1">
                                <span>
                                    Patches uploaded by <strong>sqs</strong>{' '}
                                    <span className="text-muted">4 hours ago</span>
                                </span>
                                <div className="flex-1" />
                                <CampaignChangesetsEditButton
                                    campaign={campaign}
                                    buttonClassName="btn btn-secondary ml-3 pr-1"
                                />
                            </div>
                        </div>
                    </div>
                    <CampaignStatus campaign={campaign} afterRetry={afterRetry} history={history} className="mt-3" />
                </Timeline>
            </div>
            <nav className="mt-5 mb-3 border-top border-bottom pt-2">
                <div className="container d-flex align-items-center">
                    <Link to="#TODO" className="font-weight-bold mb-0 mr-4 text-body border-bottom border-primary pb-2">
                        Changesets
                        <span className="badge badge-secondary ml-2">{campaign.changesets.totalCount}</span>
                    </Link>
                    <Link to="#TODO" className="mb-0 font-weight-normal text-body pb-2">
                        Burndown chart
                    </Link>
                    <div className="flex-1" />
                </div>
            </nav>
            <div className="container">
                <a id="changesets" />
                <div className="d-flex align-items-center flex-wrap mb-2">
                    <div className="btn-group">
                        <Link to="#TODO" className="btn btn-secondary">
                            All
                        </Link>
                        <Link to="#TODO" className="btn btn-link border">
                            Open
                        </Link>
                        <Link to="#TODO" className="btn btn-link border">
                            Approved &amp; passing checks
                        </Link>
                        <Link to="#TODO" className="btn btn-link border">
                            Awaiting review
                        </Link>
                        <Link to="#TODO" className="btn btn-link border">
                            Failing checks
                        </Link>
                        <Link to="#TODO" className="btn btn-link border">
                            Unpublished
                        </Link>
                    </div>
                    <div className="flex-1" />
                    <CampaignChangesetsAddExistingButton
                        campaign={campaign}
                        buttonClassName="btn btn-secondary mr-2 pr-1"
                        history={history}
                    />
                    <CampaignChangesetsEditButton campaign={campaign} buttonClassName="btn btn-secondary pr-1" />
                </div>
                <CampaignChangesets
                    campaign={campaign}
                    changesetUpdates={changesetUpdates}
                    campaignUpdates={campaignUpdates}
                    queryChangesets={queryChangesets}
                    history={history}
                    location={location}
                    isLightTheme={isLightTheme}
                    extensionsController={extensionsController}
                    platformContext={platformContext}
                    telemetryService={telemetryService}
                    after={
                        campaign.viewerCanAdminister && (
                            <div className="d-flex align-items-center">
                                {patchSet && (
                                    <CampaignDiffStat
                                        campaign={campaign}
                                        patchSet={patchSet}
                                        className="ml-2 mr-2 mb-0"
                                    />
                                )}
                                <button type="button" className="btn btn-secondary">
                                    Publish all
                                </button>
                            </div>
                        )
                    }
                />
            </div>
        </>
    )
}
