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
import { CampaignProgressCard } from './CampaignProgressCard'

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
            <CampaignProgressCard
                campaign={campaign}
                changesetCounts={
                    /* TODO(sqs) */
                    campaign.changesetCountsOverTime.length > 0 &&
                    campaign.changesetCountsOverTime.some(e => e.total > 0)
                        ? {
                              ...campaign.changesetCountsOverTime[campaign.changesetCountsOverTime.length - 1],
                              unpublished: 123 /* TODO(sqs) */,
                          }
                        : /* TODO(sqs) */
                          { total: 107, merged: 23, closed: 8, open: 67, unpublished: 9 }
                }
                history={history}
                className="w-100 mt-3"
            />
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
