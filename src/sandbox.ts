import { ConfigurationManager } from './config/configuration-manager';

import Workspace from './workspace/workspace';

ConfigurationManager.load();
Workspace.init(true, true);