# SPDX-FileCopyrightText: the secureCodeBox authors
#
# SPDX-License-Identifier: Apache-2.0

ARG namespace
ARG baseImageTag
FROM node:22-alpine AS install
RUN mkdir -p /home/app
WORKDIR /home/app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS build
RUN mkdir -p /home/app
WORKDIR /home/app
COPY package.json package-lock.json ./
RUN npm ci
COPY hook.ts scan-helpers.ts scope-limiter.ts kubernetes-label-selector.ts ./
RUN npm run build

FROM ${namespace:-securecodebox}/hook-sdk-nodejs:${baseImageTag:-latest}
WORKDIR /home/app/hook-wrapper/hook/
COPY --chown=root:root --chmod=755 package.json package-lock.json ./
COPY --from=install --chown=root:root --chmod=755 /home/app/node_modules/ ./node_modules/
COPY --from=build --chown=root:root --chmod=755 /home/app/build/ ./

