import React, { useState, useCallback } from 'react'
import MenuDownIcon from 'mdi-react/MenuDownIcon'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { Link } from 'react-router-dom'
import { Popover } from 'reactstrap'
import { AddChangesetForm } from '../AddChangesetForm'
import H from 'history'

interface Props {
    campaign: Pick<GQL.ICampaign, 'id' | 'url'>
    children?: React.ReactFragment
    buttonClassName?: string
    history: H.History
}

export const CampaignChangesetsAddExistingButton: React.FunctionComponent<Props> = ({
    campaign,
    children = (
        <>
            Track existing changeset <MenuDownIcon />
        </>
    ),
    buttonClassName = '',
    history,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const toggleIsOpen = useCallback<React.MouseEventHandler>(
        event => {
            event.preventDefault()
            setIsOpen(!isOpen)
        },
        [isOpen]
    )

    const id = 'CampaignChangesetsAddExistingButton'

    return (
        <>
            <Link
                to={`${campaign.url}/edit`}
                onClick={toggleIsOpen}
                id={id}
                className={`d-inline-flex align-items-center ${buttonClassName}`}
            >
                {children}
            </Link>
            <Popover placement="bottom-end" isOpen={isOpen} target={id} toggle={toggleIsOpen} innerClassName="p-3">
                <AddChangesetForm campaignID={campaign.id} history={history} onAdd={() => console.log('TODO(sqs)')} />
            </Popover>
        </>
    )
}
