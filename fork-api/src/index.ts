import { Env } from './types'

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const forkApi = `https://api.tenderly.co/api/v1/account/${env.TENDERLY_USER}/project/${env.TENDERLY_PROJECT}/fork`
    const forkApiHeaders = new Headers({
      'X-Access-Key': env.TENDERLY_ACCESS_KEY,
    })

    return new Response('Hello World!')
  },
}
