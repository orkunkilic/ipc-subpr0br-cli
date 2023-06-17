#!/usr/bin/env node

// Import the necessary modules
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const { SpheronClient, DomainTypeEnum } = require("@spheron/compute");
 
// Parse the arguments
const argv = yargs(hideBin(process.argv)).options({
  'root_rpc': { type: 'string', demandOption: true, describe: 'root rpc value' },
  'subnet_rpc': { type: 'string', demandOption: true, describe: 'subnet rpc value' },
  'spheron_api_key': { type: 'string', demandOption: true, describe: 'spheron api key' },
  // 'domain': { type: 'string', demandOption: true, describe: 'domain' },
}).argv;

// Display the arguments
console.log("root_rpc: " + argv.root_rpc);
console.log("subnet_rpc: " + argv.subnet_rpc);
console.log("spheron_api_key: " + argv.spheron_api_key);

const main = async () => {
  try {
      // Create a new client
      const client = new SpheronClient({ token: argv.spheron_api_key });

      const organization = await client.organization.get();
      console.log("Organization: " + JSON.stringify(organization));

      /* const computeMachines = await client.computeMachine.get({
        skip: 0,
        limit: 10,
        search: "2Gi"
      });
      console.log("Compute Machines: " + JSON.stringify(computeMachines)); */

      const instanceResponse = await client.instance.create({
        clusterName: "ipc-explorer",
        configuration: {
          image: "omkomkomk/ipc-subpr0br",
          tag: "latest",
          ports: [{ containerPort: 3002, exposedPort: 8000 }],
          environmentVariables: [
            { key: "ROOT_RPC", value: argv.root_rpc },
            { key: "SUBNET_RPC", value: argv.subnet_rpc },
          ],
          secretEnvironmentVariables: [
            // Hardcoded for now. Hardhat private key, safe to push.
            { key: "PRIVATE_KEY", value: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" },
          ],
          commands: [],
          args: [],
          region: "any",
          machineImageId: "6331ecb770dbf4bd413e73ac"
        },
        healthCheckConfig: {
          path: "/",
          port: 8000
        }
      });

      console.log("Instance: " + JSON.stringify(instanceResponse));

      const deployment = await client.instance.getInstanceDeployment(instanceResponse.instanceDeploymentId);
      console.log("Deployment: " + JSON.stringify(deployment));

      /* const domain = await client.instance.addDomain(instanceResponse.instanceId, {
        name: argv.domain,
        type: DomainTypeEnum.DOMAIN,
        link: deployment.connectionUrls[0]
      });
      console.log("Domain: " + JSON.stringify(domain));

      const domainVerification = await client.instance.verifyDomain(instanceResponse.instanceId, domain.id);
      console.log("Domain Verification: " + JSON.stringify(domainVerification)); */

  } catch (e) {
      console.log("Error: " + e);
      return;
  }
}

main();
