ARG VARIANT="25-alpine"
FROM node:${VARIANT}

# Install apps
  RUN apk update
  RUN apk add git
  RUN apk add bash
  RUN npm install -g pnpm
  RUN npm install -g plop

# Build workspace
  ARG workspace
  WORKDIR "${workspace}"

# Set environment
  RUN git config --system commit.template "${workspace}/.gitmessage"
