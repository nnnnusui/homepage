ARG VARIANT="v1.60.0-noble"
FROM mcr.microsoft.com/playwright:${VARIANT}

# Install apps
RUN apt update -y
RUN apt install -y git
RUN npm install -y -g n
RUN n stable
RUN apt purge -y nodejs npm
RUN npm install -g pnpm
RUN npm install -g plop
RUN npm install -g jiti

# Build workspace
ARG workspace
WORKDIR "${workspace}"

# Set environment
RUN git config --system commit.template "${workspace}/.gitmessage"
