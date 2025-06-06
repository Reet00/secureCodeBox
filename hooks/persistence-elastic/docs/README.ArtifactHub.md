<!--
SPDX-FileCopyrightText: the secureCodeBox authors

SPDX-License-Identifier: Apache-2.0
-->
<!--
.: IMPORTANT! :.
--------------------------
This file is generated automatically with `helm-docs` based on the following template files:
- ./.helm-docs/templates.gotmpl (general template data for all charts)
- ./chart-folder/.helm-docs.gotmpl (chart specific template data)

Please be aware of that and apply your changes only within those template files instead of this file.
Otherwise your changes will be reverted/overwritten automatically due to the build process `./.github/workflows/helm-docs.yaml`
--------------------------
-->

<p align="center">
  <a href="https://opensource.org/licenses/Apache-2.0"><img alt="License Apache-2.0" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg"/></a>
  <a href="https://github.com/secureCodeBox/secureCodeBox/releases/latest"><img alt="GitHub release (latest SemVer)" src="https://img.shields.io/github/v/release/secureCodeBox/secureCodeBox?sort=semver"/></a>
  <a href="https://owasp.org/www-project-securecodebox/"><img alt="OWASP Lab Project" src="https://img.shields.io/badge/OWASP-Lab%20Project-yellow"/></a>
  <a href="https://artifacthub.io/packages/search?repo=securecodebox"><img alt="Artifact HUB" src="https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/securecodebox"/></a>
  <a href="https://github.com/secureCodeBox/secureCodeBox/"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/secureCodeBox/secureCodeBox?logo=GitHub"/></a>
  <a href="https://infosec.exchange/@secureCodeBox"><img alt="Mastodon Follower" src="https://img.shields.io/mastodon/follow/111902499714281911?domain=https%3A%2F%2Finfosec.exchange%2F"/></a>
</p>

## What is OWASP secureCodeBox?

<p align="center">
  <img alt="secureCodeBox Logo" src="https://www.securecodebox.io/img/Logo_Color.svg" width="250px"/>
</p>

_[OWASP secureCodeBox][scb-github]_ is an automated and scalable open source solution that can be used to integrate various *security vulnerability scanners* with a simple and lightweight interface. The _secureCodeBox_ mission is to support *DevSecOps* Teams to make it easy to automate security vulnerability testing in different scenarios.

With the _secureCodeBox_ we provide a toolchain for continuous scanning of applications to find the low-hanging fruit issues early in the development process and free the resources of the penetration tester to concentrate on the major security issues.

The secureCodeBox project is running on [Kubernetes](https://kubernetes.io/). To install it you need [Helm](https://helm.sh), a package manager for Kubernetes. It is also possible to start the different integrated security vulnerability scanners based on a docker infrastructure.

### Quickstart with secureCodeBox on Kubernetes

You can find resources to help you get started on our [documentation website](https://www.securecodebox.io) including instruction on how to [install the secureCodeBox project](https://www.securecodebox.io/docs/getting-started/installation) and guides to help you [run your first scans](https://www.securecodebox.io/docs/getting-started/first-scans) with it.

## What is "Persistence ElasticSearch" Hook about?

The ElasticSearch persistenceProvider hook saves all findings and reports into the configured ElasticSearch index.
This allows for some easy searching and visualization of the findings. To learn more about Elasticsearch visit [elastic.io].

Installing the Elasticsearch persistenceProvider hook will add a _ReadOnly Hook_ to your namespace.

This hook supports both Elasticsearch as well as OpenSearch. The configuration is the same for both.

## Deployment
The persistence-elastic chart can be deployed via helm:

```bash
# Install HelmChart (use -n to configure another namespace)
helm upgrade --install persistence-elastic oci://ghcr.io/securecodebox/helm/persistence-elastic
```

## Requirements

Kubernetes: `>=v1.11.0-0`

## Additional Chart Configurations

### Connecting the hook an Elasticsearch Cluster

The Elastic hook requires an existing Elasticsearch instance to store findings. To set up the hook, follow these steps:

1. **Deploy an Elasticsearch Cluster**:
   You can deploy an Elasticsearch cluster using various methods, such as using the official Elastic Cloud, self-hosting, or using a managed service. For Kubernetes environments, we recommend using the [Elastic Cloud on Kubernetes (ECK)](https://www.elastic.co/elastic-cloud-kubernetes) operator.
   See the [ECK documentation](https://www.elastic.co/docs/deploy-manage/deploy/cloud-on-k8s) for instructions on deploying Elasticsearch.

2. **Create a Custom Values File**:
   Create a new `custom-values.yaml` file with the following content to configure the hook to connect to your Elasticsearch instance:

   ```yaml
   externalElasticStack:
     elasticsearchAddress: "https://quickstart-es-http:9200" # these are the default values for the ECK quickstart, change them to match your setup
     kibanaAddress: "https://quickstart-kb-http:5601"

   authentication:
     userSecret: "elasticsearch-credentials-secret"
     # Alternatively, use an API key:
     # apiKeySecret: "elasticsearch-api-key-secret"
   ```

3. **Create Kubernetes Secrets for Elasticsearch Credentials**:
   Use the following `kubectl` command to create a secret for Elasticsearch credentials:

   ```bash
   kubectl create secret generic elasticsearch-credentials-secret \
     --from-literal=username=your-username \
     --from-literal=password=your-password
   ```

   If using an API key, create the secret as follows:

   ```bash
   kubectl create secret generic elasticsearch-api-key-secret \
     --from-literal=id=your-api-key-id \
     --from-literal=key=your-api-key
   ```

4. **Deploy the Hook**:
   Install the persistence-elastic chart using Helm with the custom values file:

   ```bash
   helm upgrade --install persistence-elastic oci://ghcr.io/securecodebox/helm/persistence-elastic --values custom-values.yaml
   ```

Ensure that the `userSecret` or `apiKeySecret` is created in your Kubernetes cluster with the appropriate credentials for accessing your Elasticsearch instance.

### Elasticsearch Indexing

For the elasticsearch `indexSuffix` you can provide a date format pattern. We use [Luxon](https://moment.github.io/luxon/) to format the date. So checkout
the [Luxon documentation](https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens) to see what kind of format patterns you can use for the
`indexSuffix`. Default pattern is `yyyy-MM-dd`

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` |  |
| authentication | object | `{"apiKeySecret":null,"userSecret":null}` | Configure authentication schema and credentials the persistence provider should use to connect to elasticsearch user and apikey are mutually exclusive, only set one! |
| authentication.apiKeySecret | string | `nil` | Link a pre-existing generic secret with `id` and `key` key / value pairs |
| authentication.userSecret | string | `nil` | Link a pre-existing generic secret with `username` and `password` key / value pairs |
| dashboardImporter.enabled | bool | `true` | Enable if you want to import some example kibana dashboards for secureCodeBox findings analytics. |
| dashboardImporter.image.repository | string | `"securecodebox/persistence-elastic-dashboard-importer"` |  |
| dashboardImporter.image.tag | string | `nil` |  |
| externalElasticStack.elasticsearchAddress | string | `"https://elasticsearch.example.com"` | The URL of the elasticsearch service to persists all findings to. |
| externalElasticStack.kibanaAddress | string | `"https://kibana.example.com"` | The URL of the kibana service used to visualize all findings. |
| fullnameOverride | string | `""` |  |
| hook.affinity | object | `{}` | Optional affinity settings that control how the hook job is scheduled (see: https://kubernetes.io/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/) |
| hook.env | list | `[]` | Optional environment variables mapped into the hook (see: https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/) |
| hook.extraVolumeMounts | list | `[]` | Optional VolumeMounts mapped into the hook (see: https://kubernetes.io/docs/concepts/storage/volumes/) |
| hook.extraVolumes | list | `[]` | Optional Volumes mapped into the hook (see: https://kubernetes.io/docs/concepts/storage/volumes/) |
| hook.image.repository | string | `"docker.io/securecodebox/hook-persistence-elastic"` | Hook image repository |
| hook.image.tag | string | defaults to the charts version | The image Tag defaults to the charts version if not defined. |
| hook.labels | object | `{}` | Add Kubernetes Labels to the hook definition |
| hook.priority | int | `0` | Hook priority. Higher priority Hooks are guaranteed to execute before low priority Hooks. |
| hook.resources | object | `{ requests: { cpu: "200m", memory: "100Mi" }, limits: { cpu: "400m", memory: "200Mi" } }` | Optional resources lets you control resource limits and requests for the hook container. See https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| hook.tolerations | list | `[]` | Optional tolerations settings that control how the hook job is scheduled (see: https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/) |
| hook.ttlSecondsAfterFinished | string | `nil` | Seconds after which the kubernetes job for the hook will be deleted. Requires the Kubernetes TTLAfterFinished controller: https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/ |
| imagePullSecrets | list | `[]` | Define imagePullSecrets when a private registry is used (see: https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/) |
| indexAppendNamespace | bool | `true` | Define if the name of the namespace where this hook is deployed to must be added to the index name. The namespace can be used to separate index by tenants (namespaces). |
| indexPrefix | string | `"scb"` | Define a specific index prefix used for all elasticsearch indices. |
| indexSuffix | string | `"yyyy-MM-dd"` | Define a specific index suffix based on date pattern (YEAR (yyyy), MONTH (yyyy-MM), WEEK (yyyy-'W'W), DATE (yyyy-MM-dd)). We use Luxon for date formatting (https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens) |
| nameOverride | string | `""` |  |
| nodeSelector | object | `{}` |  |
| podSecurityContext | object | `{}` |  |
| resources | object | `{}` |  |
| securityContext | object | `{}` |  |
| tolerations | list | `[]` |  |

## Contributing

Contributions are welcome and extremely helpful 🙌
Please have a look at [Contributing](./CONTRIBUTING.md)

## Community

You are welcome, please join us on... 👋

- [GitHub][scb-github]
- [OWASP Slack (Channel #project-securecodebox)][scb-slack]
- [Mastodon][scb-mastodon]

secureCodeBox is an official [OWASP][scb-owasp] project.

## License
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Code of secureCodeBox is licensed under the [Apache License 2.0][scb-license].

[scb-owasp]:    https://www.owasp.org/index.php/OWASP_secureCodeBox
[scb-docs]:     https://www.securecodebox.io/
[scb-site]:     https://www.securecodebox.io/
[scb-github]:   https://github.com/secureCodeBox/
[scb-mastodon]: https://infosec.exchange/@secureCodeBox
[scb-slack]:    https://owasp.org/slack/invite
[scb-license]:  https://github.com/secureCodeBox/secureCodeBox/blob/master/LICENSE
[elastic.io]: https://www.elastic.co/products/elasticsearch
