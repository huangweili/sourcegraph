import React, { useState, useCallback } from 'react'
import MenuDownIcon from 'mdi-react/MenuDownIcon'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { Link } from 'react-router-dom'
import { Popover } from 'reactstrap'

interface Props {
    campaign: Pick<GQL.ICampaign, 'id' | 'url'>
    children?: React.ReactFragment
    buttonClassName?: string
}

export const CampaignChangesetsEditButton: React.FunctionComponent<Props> = ({
    campaign,
    children = (
        <>
            Update patches <MenuDownIcon />
        </>
    ),
    buttonClassName = '',
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const toggleIsOpen = useCallback<React.MouseEventHandler>(
        event => {
            event.preventDefault()
            setIsOpen(!isOpen)
        },
        [isOpen]
    )

    const id = 'CampaignChangesetsEditButton'

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
                <p>TODO(sqs) Using the Sourcegraph CLI, run:</p>
                <pre>
                    <code>src actions exec -f action.json | src campaign update -preview -id={campaign.id}</code>
                </pre>
            </Popover>
        </>
    )
}
