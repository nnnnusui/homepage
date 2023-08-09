ARG VARIANT="20-alpine"
FROM node:${VARIANT}

# Install apps
  RUN apk update
  RUN apk add git
  RUN npm install -g pnpm
  RUN npm install -g plop

# Build workspace
  ARG workspace
  WORKDIR "${workspace}"
