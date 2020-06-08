import React from 'react'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { CampaignInfoBar } from '../CampaignInfoBar'
import { Timeline } from '../../../../components/timeline/Timeline'
import { CampaignDescription } from '../CampaignDescription'
import { CampaignStatus } from '../CampaignStatus'
import H from 'history'
import { MinimalCampaign } from '../CampaignArea'
import { CampaignProgressCard } from './CampaignProgressCard'
import { CampaignUpdatesCard } from './CampaignUpdatesCard'

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
            <CampaignUpdatesCard
                campaign={{
                    ...campaign,
                    /* TODO(sqs) */ patchesSetAt: campaign.updatedAt,
                    patchSetter: campaign.author,
                }}
                history={history}
                className="w-100 mt-3"
            />
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
