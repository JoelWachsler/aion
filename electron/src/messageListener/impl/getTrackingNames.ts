import { Environment } from '../../environment/environment'
import { sendUpdatedTrackingNames } from '../messageListener'

export const getTrackingNames = async(env: Environment) => {
  env.logger.info('Sending track name update')
  await sendUpdatedTrackingNames(env)
}
