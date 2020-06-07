import React, { useState, useCallback } from 'react'
import MenuDownIcon from 'mdi-react/MenuDownIcon'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { Link } from 'react-router-dom'
import { Popover } from 'reactstrap'
import { CopyableText } from '../../../../components/CopyableText'
import HelpCircleOutlineIcon from 'mdi-react/HelpCircleOutlineIcon'

interface Props {
    campaign: Pick<GQL.ICampaign, 'id' | 'url'>
    tag?: 'span' | 'button' | Link
    children?: React.ReactFragment
    buttonClassName?: string
}

export const CampaignChangesetsEditButton: React.FunctionComponent<Props> = ({
    campaign,
    tag: Tag = 'span',
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

    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null)
    const popoverTargetReference = useCallback((element: HTMLElement | null) => setPopoverTarget(element), [])

    return (
        <>
            <Tag
                to={`${campaign.url}/edit`}
                onClick={toggleIsOpen}
                className={`d-inline-flex align-items-center ${buttonClassName}`}
                ref={popoverTargetReference}
            >
                {children}
            </Tag>
            {popoverTarget && (
                <Popover
                    placement="bottom-end"
                    isOpen={isOpen}
                    target={popoverTarget}
                    toggle={toggleIsOpen}
                    innerClassName="p-3"
                    style={{ maxWidth: '54rem' }}
                >
                    <p>Generate and upload patches:</p>
                    <pre style={{ backgroundColor: '#f3f3fa', overflow: 'auto' }} className="p-3">
                        <code>
                            src actions exec -f action.json | \<br />
                            &nbsp;&nbsp;src campaign update -preview -id={campaign.id}
                        </code>
                    </pre>
                    <p>Then open the link to preview and apply the changes.</p>
                    <ul className="list-unstyled mb-0 mt-3">
                        <li>
                            <a href="TODO(sqs)" className="d-flex align-items-center">
                                <HelpCircleOutlineIcon className="icon-inline mr-1" /> How to install Sourcegraph CLI
                            </a>
                        </li>
                        <li>
                            <a href="TODO(sqs)" className="d-flex align-items-center">
                                <HelpCircleOutlineIcon className="icon-inline mr-1" /> How to define campaign actions
                            </a>
                        </li>
                    </ul>
                </Popover>
            )}
        </>
    )
}
