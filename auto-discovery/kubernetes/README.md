---
title: "secreCodeBox AutoDiscovery for Kubernetes"
category: "core"
type: "AutoDiscovery"
state: "released"
appVersion: ""
usecase: "secureCodeBox AutoDiscovery for Kubernetes discovers and starts scans for apps running in the cluster."
---

![auto-discovery logo](https://www.securecodebox.io/img/Logo_Color.svg)

The secureCodeBox _AutoDiscovery_ is running on kubernetes (K8S) and is an optional component of the complete secureCodeBox stack.
The Kubernetes AutoDiscovery needs to be deployed along side the secureCodeBox Operator. It monitors security relevant resources inside a K8S environment and automatically create scans to continuously monitor security aspects of the resources.

<!-- end -->

The AutoDiscovery controller will automatically detect these new resources (services and containers) and start secureCodeBox _scans_ for them:

1. A ZAP Baseline Scan to detect basic web vulnerabilities in the service. (Using ZAP-automation-framework)
2. An image scan scanning for vulnerable libraries in the docker / container image of the deployment. (Using trivy)
3. (WIP) A TLS Scan against the certificate of the ingress for the host. (Using SSLyze)

The AutoDiscovery automatically tracks the lifecycle of the kubernetes resources and will automatically start new scans for new application versions.

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

## Example

<p align="center">
  <img width="950" src="./auto-discovery-demo.svg" alt="AutoDiscovery CLI Example">
</p>

This example deploys [JuiceShop](https://owasp.org/www-project-juice-shop/) to a new Kubernetes Namespace.
(You can find the kubernetes manifests for the deployment [here](./demo/juice-shop.yaml))

The AutoDiscovery will automatically pick up this new deployment and then starts a ZAP Scan against it.
The scan created uses our `zap-automation-framework` ScanType by default, this can be changed with the `config.serviceAutoDiscovery.scanConfig.scanType` config on the autoDiscovery helm release.

When the ContainerAutoDiscovery is enabled, the AutoDiscovery can also create a trivy scan for each unique container image (having multiple pods with the same container will only create one scan). The ScanType can be defined with `config.containerAutoDiscovery.scanConfig.scanType`.

## Deployment
The auto-discovery-kubernetes chart can be deployed via helm:

```bash
# Install HelmChart (use -n to configure another namespace)
helm upgrade --install auto-discovery-kubernetes oci://ghcr.io/securecodebox/helm/auto-discovery-kubernetes
```

## Requirements

Kubernetes: `>=v1.11.0-0`

### In / Excluding Resources from the AutoDiscovery

The AutoDiscovery allows different modes to determine if a resource is supposed to be scanned.
These modes allow you to gradually roll out the AutoDiscovery in a cluster.
This allows to roll it out in cluster without a "big bang" where the AutoDiscovery starts a scan for every app in the cluster which would likely exhaust the clusters compute resources.

The three different modes are:

1. `enabled-per-namespace` (default): [See section](#enabled-per-namespace-mode-default)
2. `enabled-per-resource`: [See section](#enabled-per-resource-mode)
3. `all`: [See section](#all-mode)

#### Enabled per Namespace Mode (default)

Enable this by setting `config.resourceInclusion.mode=enable-per-namespace`.

This mode will start scans for resources in namespaces with the annotation `auto-discovery.securecodebox.io/enabled=true`.

```bash
# enable AutoDiscovery in namespace "juice-shop"
kubectl annotate namespace juice-shop auto-discovery.securecodebox.io/enabled=true
```

If you want to exclude a certain resource in a otherwise AutoDiscovery enabled namespace, you can exclude it by annotating it with `auto-discovery.securecodebox.io/ignore=true`.

```bash
# disable AutoDiscovery for service "foobar"
kubectl -n juice-shop annotate service foobar auto-discovery.securecodebox.io/ignore=true
```

#### Enabled per Resource Mode

Enable this by setting `config.resourceInclusion.mode=enabled-per-resource`.

This mode will start scans for every resources with the annotation `auto-discovery.securecodebox.io/enabled=true`.

```bash
# enable AutoDiscovery for service "juice-shop"
kubectl -n juice-shop annotate service juice-shop auto-discovery.securecodebox.io/enabled=true
```

#### All Mode

Enable this by setting `config.resourceInclusion.mode=all`.

This mode will start scans for **every** resources in the cluster **unless** it has the annotation `auto-discovery.securecodebox.io/ignore=true`.

> ⚠️ Using this setting in larger cluster will likely start a large number of scans in the cluster. This could block all available compute resource in your cluster and seriously affect your applications availability.

```bash
# *disable* AutoDiscovery for service "juice-shop"
kubectl -n juice-shop annotate service juice-shop auto-discovery.securecodebox.io/ignore=true
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| config.apiVersion | string | `"config.securecodebox.io/v1"` |  |
| config.cluster.name | string | `"docker-desktop"` |  |
| config.containerAutoDiscovery.enabled | bool | `false` |  |
| config.containerAutoDiscovery.imagePullSecretConfig.mapImagePullSecretsToEnvironmentVariables | bool | `true` |  |
| config.containerAutoDiscovery.imagePullSecretConfig.passwordEnvironmentVariableName | string | `"TRIVY_PASSWORD"` |  |
| config.containerAutoDiscovery.imagePullSecretConfig.usernameEnvironmentVariableName | string | `"TRIVY_USERNAME"` |  |
| config.containerAutoDiscovery.passiveReconcileInterval | string | `"1m"` | interval in which every pod is re-checked for updates, currently used to periodically check if the configured scantype is installed in the namespace of the pod |
| config.containerAutoDiscovery.scanConfigs[0].annotations | object | `{"defectdojo.securecodebox.io/engagement-name":"{{ .Target.Name }}","defectdojo.securecodebox.io/engagement-version":"{{if (index .Target.Labels `app.kubernetes.io/version`) }}{{ index .Target.Labels `app.kubernetes.io/version` }}{{end}}","defectdojo.securecodebox.io/product-name":"{{ .Cluster.Name }} | {{ .Namespace.Name }} | {{ .Target.Name }}","defectdojo.securecodebox.io/product-tags":"cluster/{{ .Cluster.Name }},namespace/{{ .Namespace.Name }}"}` | annotations to be added to the scans started by the auto-discovery, all annotation values support templating |
| config.containerAutoDiscovery.scanConfigs[0].env | list | `[]` | allows to overwrite the env var list of the scan job. the value field supports templating. |
| config.containerAutoDiscovery.scanConfigs[0].hookSelector | object | `{}` | hookSelector allows to specify a LabelSelector with which the hooks are selected, see: https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#label-selectors Both matchLabels and matchExpressions are supported. All values in the matchLabels map support templating. MatchExpressions support templating in the `key` field and in every entry in the `values` list. If a value in the list renders to an empty string it is removed from the list. |
| config.containerAutoDiscovery.scanConfigs[0].labels | object | `{}` | labels to be added to the scans started by the auto-discovery, all label values support templating |
| config.containerAutoDiscovery.scanConfigs[0].name | string | `"trivy"` | unique name to distinguish scans |
| config.containerAutoDiscovery.scanConfigs[0].parameters | list | `["{{ .ImageID }}"]` | parameters used for the scans created by the containerAutoDiscovery, all parameters support templating |
| config.containerAutoDiscovery.scanConfigs[0].repeatInterval | string | `"168h"` | interval in which scans are automatically repeated. If the target is updated (meaning a new image revision is deployed) the scan will repeated beforehand and the interval is reset. |
| config.containerAutoDiscovery.scanConfigs[0].scanType | string | `"trivy-image-autodiscovery"` |  |
| config.containerAutoDiscovery.scanConfigs[0].volumeMounts | list | `[]` | volumeMounts to add to the scan job, see: https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#volumes-1 the fields: `name`, `mountPath`, `subPath`, `subPathExpr` of each volumeMount support templating |
| config.containerAutoDiscovery.scanConfigs[0].volumes | list | `[]` | volumes to add to the scan job, see: https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#volumes the fields: `name`, `secret.secretName`, `configMap.name` of each volume support templating |
| config.health.healthProbeBindAddress | string | `":8081"` |  |
| config.kind | string | `"AutoDiscoveryConfig"` |  |
| config.leaderElection.leaderElect | bool | `true` |  |
| config.leaderElection.resourceName | string | `"0e41a1f4.securecodebox.io"` |  |
| config.metrics.bindAddress | string | `"127.0.0.1:8080"` |  |
| config.resourceInclusion.mode | string | `"enabled-per-namespace"` |  |
| config.serviceAutoDiscovery.enabled | bool | `true` |  |
| config.serviceAutoDiscovery.passiveReconcileInterval | string | `"1m"` | interval in which every service is re-checked for updated pods, if service object is updated directly this the service will get reconciled immediately |
| config.serviceAutoDiscovery.scanConfigs[0] | object | `{"annotations":{"defectdojo.securecodebox.io/engagement-name":"{{ .Target.Name }}","defectdojo.securecodebox.io/engagement-version":"{{if (index .Target.Labels `app.kubernetes.io/version`) }}{{ index .Target.Labels `app.kubernetes.io/version` }}{{end}}","defectdojo.securecodebox.io/product-name":"{{ .Cluster.Name }} | {{ .Namespace.Name }} | {{ .Target.Name }}","defectdojo.securecodebox.io/product-tags":"cluster/{{ .Cluster.Name }},namespace/{{ .Namespace.Name }}"},"env":[{"name":"TARGET_URL","value":"{{ .Host.Type }}://{{ .Service.Name }}.{{ .Service.Namespace }}.svc:{{ .Host.Port }}"}],"hookSelector":{},"labels":{},"name":"zap","parameters":["-autorun","/home/securecodebox/scb-automation/automation.yaml"],"repeatInterval":"168h","scanType":"zap-automation-framework","volumeMounts":[{"mountPath":"/home/securecodebox/scb-automation/automation.yaml","name":"zap-automation-framework-baseline-config","subPath":"automation.yaml"}],"volumes":[{"configMap":{"name":"zap-automation-framework-baseline-config"},"name":"zap-automation-framework-baseline-config"}]}` | scanType used for the scans created by the serviceAutoDiscovery |
| config.serviceAutoDiscovery.scanConfigs[0].annotations | object | `{"defectdojo.securecodebox.io/engagement-name":"{{ .Target.Name }}","defectdojo.securecodebox.io/engagement-version":"{{if (index .Target.Labels `app.kubernetes.io/version`) }}{{ index .Target.Labels `app.kubernetes.io/version` }}{{end}}","defectdojo.securecodebox.io/product-name":"{{ .Cluster.Name }} | {{ .Namespace.Name }} | {{ .Target.Name }}","defectdojo.securecodebox.io/product-tags":"cluster/{{ .Cluster.Name }},namespace/{{ .Namespace.Name }}"}` | annotations to be added to the scans started by the auto-discovery, all annotation values support templating |
| config.serviceAutoDiscovery.scanConfigs[0].env | list | `[{"name":"TARGET_URL","value":"{{ .Host.Type }}://{{ .Service.Name }}.{{ .Service.Namespace }}.svc:{{ .Host.Port }}"}]` | allows to overwrite the env var list of the scan job. the value field supports templating. |
| config.serviceAutoDiscovery.scanConfigs[0].hookSelector | object | `{}` | HookSelector allows to specify a LabelSelector with which the hooks are selected, see: https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#label-selectors Both matchLabels and matchExpressions are supported. All values in the matchLabels map support templating. MatchExpressions support templating in the `key` field and in every entry in the `values` list. If a value in the list renders to an empty string it is removed from the list. |
| config.serviceAutoDiscovery.scanConfigs[0].labels | object | `{}` | labels to be added to the scans started by the auto-discovery, all label values support templating |
| config.serviceAutoDiscovery.scanConfigs[0].name | string | `"zap"` | unique name to distinguish scans |
| config.serviceAutoDiscovery.scanConfigs[0].parameters | list | `["-autorun","/home/securecodebox/scb-automation/automation.yaml"]` | parameters used for the scans created by the serviceAutoDiscovery, all parameters support templating |
| config.serviceAutoDiscovery.scanConfigs[0].volumeMounts | list | `[{"mountPath":"/home/securecodebox/scb-automation/automation.yaml","name":"zap-automation-framework-baseline-config","subPath":"automation.yaml"}]` | volumeMounts to add to the scan job, see: https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#volumes-1 the fields: `name`, `mountPath`, `subPath`, `subPathExpr` of each volumeMount support templating |
| config.serviceAutoDiscovery.scanConfigs[0].volumes | list | `[{"configMap":{"name":"zap-automation-framework-baseline-config"},"name":"zap-automation-framework-baseline-config"}]` | volumes to add to the scan job, see: https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#volumes the fields: `name`, `secret.secretName`, `configMap.name` of each volume support templating |
| image.pullPolicy | string | `"IfNotPresent"` | Image pull policy. One of Always, Never, IfNotPresent. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise. More info: https://kubernetes.io/docs/concepts/containers/images#updating-images |
| image.repository | string | `"securecodebox/auto-discovery-kubernetes"` |  |
| image.tag | string | `nil` |  |
| imagePullSecrets | list | `[]` | Define imagePullSecrets when a private registry is used (see: https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/) |
| podSecurityContext | object | `{}` | Sets the securityContext on the operators pod level. See: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/#set-the-security-context-for-a-container |
| resources | object | `{"limits":{"cpu":"100m","memory":"100Mi"},"requests":{"cpu":"100m","memory":"20Mi"}}` | CPU/memory resource requests/limits (see: https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/, https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/) |
| securityContext | object | `{"allowPrivilegeEscalation":false,"capabilities":{"drop":["all"]},"privileged":false,"readOnlyRootFilesystem":true,"runAsNonRoot":true}` | Sets the securityContext on the operators container level. See: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/#set-the-security-context-for-a-pod |
| securityContext.allowPrivilegeEscalation | bool | `false` | Ensure that users privileges cannot be escalated |
| securityContext.capabilities.drop[0] | string | `"all"` | This drops all linux privileges from the operator container. They are not required |
| securityContext.privileged | bool | `false` | Ensures that the operator container is not run in privileged mode |
| securityContext.readOnlyRootFilesystem | bool | `true` | Prevents write access to the containers file system |
| securityContext.runAsNonRoot | bool | `true` | Enforces that the Operator image is run as a non root user |

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
## Development

### Run the AutoDiscovery locally

To avoid having to build & deploy the AutoDiscovery every time you make a code change you can run it locally.
It automatically connects to your current cluster configured in your kube config.

```bash
make run
```

### Running the tests

```bash
# execute the tests locally
make test

# view the test coverage
go tool cover -html=cover.out
```
