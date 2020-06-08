import { configureActions } from '@storybook/addon-actions'
import { withConsole } from '@storybook/addon-console'
import { withKnobs } from '@storybook/addon-knobs'
import { addDecorator } from '@storybook/react'
import { setLinkComponent, AnchorLink } from '../shared/src/components/Link'

setLinkComponent(AnchorLink)

// Don't know why this type doesn't work, but this is the correct usage
// @ts-ignore
addDecorator(withKnobs)
addDecorator((storyFn, context) => withConsole()(storyFn)(context))

configureActions({ depth: 100, limit: 20 })
