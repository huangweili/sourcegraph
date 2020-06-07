import React from 'react'
import H from 'history'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { CampaignBurndownChart } from '../BurndownChart'

interface Props {
    campaign: Pick<GQL.ICampaign, 'changesetCountsOverTime'>
    history: H.History
}

export const CampaignBurndownChartSection: React.FunctionComponent<Props> = ({ campaign, history }) => (
    <CampaignBurndownChart changesetCountsOverTime={campaign.changesetCountsOverTime} history={history} />
)
