import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  GitHubEntityProvider
} from '@backstage/plugin-catalog-backend-module-github';


export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  builder.addEntityProvider(
    GitHubEntityProvider.fromConfig(env.config, {
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 60 },
        timeout: { minutes: 3 },
      }),
    }),
  );

  builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.setProcessingIntervalSeconds(120)
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
