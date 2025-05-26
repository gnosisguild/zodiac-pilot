import { href, redirect } from 'react-router'

export const loader = () => redirect(href('/create'))
