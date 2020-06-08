import React, { useState, useCallback, useRef } from 'react'
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

    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null)
    const popoverTargetReference = useCallback((element: HTMLElement | null) => setPopoverTarget(element), [])

    return (
        <>
            <button
                type="button"
                onClick={toggleIsOpen}
                className={`d-inline-flex align-items-center ${buttonClassName}`}
                ref={popoverTargetReference}
            >
                {children}
            </button>
            {popoverTarget && (
                <Popover
                    placement="bottom-end"
                    isOpen={isOpen}
                    target={popoverTarget}
                    toggle={toggleIsOpen}
                    innerClassName="p-3"
                    style={{ width: '30rem' }}
                >
                    <AddChangesetForm
                        campaignID={campaign.id}
                        history={history}
                        onAdd={() => console.log('TODO(sqs)')}
                    />
                </Popover>
            )}
        </>
    )
}
