import { Environment } from '../../environment/environment'

export const clearDatabase = async(env: Environment) => {
  env.logger.info('Clearing database')
  await env.clearDatabase()
}
