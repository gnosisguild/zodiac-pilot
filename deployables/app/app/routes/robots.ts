export const loader = () =>
  new Response(['User-Agent: *', 'Disallow /'].join('\n'), {
    status: 200,
    headers: new Headers({ 'Content-Type': 'text/plain' }),
  })
