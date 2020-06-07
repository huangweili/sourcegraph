import React, { useMemo } from 'react'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { MinimalCampaign, MinimalPatchSet } from '../CampaignArea'
import { Link } from '../../../../../../shared/src/components/Link'
import { CampaignChangesetsAddExistingButton } from './CampaignChangesetsAddExistingButton'
import { CampaignChangesetsEditButton } from './CampaignChangesetsEditButton'
import { CampaignChangesets } from './CampaignChangesets'
import {
    queryChangesets,
    fetchPatchSetById,
    queryPatchesFromCampaign,
    queryPatchesFromPatchSet,
    queryPatchFileDiffs,
} from '../backend'
import { CampaignDiffStat } from '../CampaignDiffStat'
import H from 'history'
import { Observable, Subject, NEVER } from 'rxjs'
import { ThemeProps } from '../../../../../../shared/src/theme'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import { PlatformContextProps } from '../../../../../../shared/src/platform/context'
import { TelemetryProps } from '../../../../../../shared/src/telemetry/telemetryService'
import { useObservable } from '../../../../../../shared/src/util/useObservable'

interface Props extends ThemeProps, ExtensionsControllerProps, PlatformContextProps, TelemetryProps {
    campaign: MinimalCampaign
    history: H.History
    location: H.Location

    fetchPatchSetById: typeof fetchPatchSetById | ((patchSet: GQL.ID) => Observable<MinimalPatchSet | null>)
    queryPatchesFromCampaign: typeof queryPatchesFromCampaign
    queryPatchesFromPatchSet: typeof queryPatchesFromPatchSet
    queryPatchFileDiffs: typeof queryPatchFileDiffs
    queryChangesets: typeof queryChangesets
}

export const CampaignChangesetsPage: React.FunctionComponent<Props> = ({
    campaign,
    history,
    location,
    queryChangesets,
    ...props
}) => {
    const patchSet = useObservable(
        useMemo(() => (campaign.patchSet?.id ? fetchPatchSetById(campaign.patchSet.id) : NEVER), [
            campaign.patchSet,
            fetchPatchSetById,
        ])
    )

    return (
        <>
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
                changesetUpdates={/* TODO(sqs)*/ new Subject<any>()}
                campaignUpdates={/* TODO(sqs)*/ new Subject<any>()}
                queryChangesets={queryChangesets}
                history={history}
                location={location}
                {...props}
                after={
                    campaign.viewerCanAdminister && (
                        <div className="d-flex align-items-center">
                            {patchSet && (
                                <CampaignDiffStat campaign={campaign} patchSet={patchSet} className="ml-2 mr-2 mb-0" />
                            )}
                            <button type="button" className="btn btn-secondary">
                                Publish all
                            </button>
                        </div>
                    )
                }
            />
        </>
    )
}
