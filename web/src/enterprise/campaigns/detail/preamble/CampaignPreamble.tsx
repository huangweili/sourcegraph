import React from 'react'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { CampaignInfoBar } from '../CampaignInfoBar'
import { Timeline } from '../../../../components/timeline/Timeline'
import { CampaignDescription } from '../CampaignDescription'
import ProgressCheckIcon from 'mdi-react/ProgressCheckIcon'
import SourcePullIcon from 'mdi-react/SourcePullIcon'
import SourceMergeIcon from 'mdi-react/SourceMergeIcon'
import { Link } from '../../../../../../shared/src/components/Link'
import { CampaignChangesetsEditButton } from '../changesets/CampaignChangesetsEditButton'
import { CampaignChangesetsAddExistingButton } from '../changesets/CampaignChangesetsAddExistingButton'
import { CampaignsIcon } from '../../icons'
import { CampaignStatus } from '../CampaignStatus'
import H from 'history'
import { MinimalCampaign } from '../CampaignArea'

interface Props {
    campaign: MinimalCampaign
    history: H.History
}

export const CampaignPreamble: React.FunctionComponent<Props> = ({ campaign, history }) => (
    <>
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
                        <Link to={`${campaign.url}/burndown`} className="btn btn-link ml-3 mr-2 border">
                            Burndown chart
                        </Link>
                        <Link to={`${campaign.url}#changesets`} className="btn btn-link border">
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
                            Patches uploaded by <strong>sqs</strong> <span className="text-muted">4 hours ago</span>
                        </span>
                        <div className="flex-1" />
                        <CampaignChangesetsEditButton
                            campaign={campaign}
                            buttonClassName="btn btn-secondary ml-3 pr-1"
                        />
                    </div>
                </div>
            </div>
            <CampaignStatus
                campaign={campaign}
                afterPublish={() => console.log('TODO(sqs)')}
                afterRetry={() => console.log('TODO(sqs)')}
                history={history}
                className="mt-3"
            />
        </Timeline>
    </>
)
