import { DataSourcesModule } from 'src/data-sources/dataSources.module';
import { DbModule } from 'src/services/db/db.module';

export default [DbModule, DataSourcesModule];
