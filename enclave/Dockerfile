
ARG UBUNTU_VERSION="22.04"


# compiler version is fixed for mrenclave
FROM ubuntu:${UBUNTU_VERSION} as eliza-gramine
ARG ELIZA_VERSION="v0.1.6-alpha.1"
ARG NVM_VERSION="v0.40.1"
ARG NODE_VERSION="v23.3.0"
ARG PNPM_VERSION="9.14.4"

SHELL ["/bin/bash", "-c"]
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install Basic Packages
RUN apt-get update
RUN apt-get install -y --no-install-recommends \
    apt-utils=2.4.13 \
    curl=7.81.0-1ubuntu1.19 \
    wget=1.21.2-2ubuntu1.1 \
    git=1:2.34.1-1ubuntu1.11 \
    ca-certificates=20240203~22.04.1 \
    libssl-dev=3.0.2-0ubuntu1.18 \
    unzip=6.0-26ubuntu3.2 \
    #pkgconf=1.8.0-1 \
    pkg-config=0.29.2-1ubuntu3 \
    reprepro=5.3.0-1.4 \
    lsb-release=11.1.0ubuntu4 \
    python3=3.10.6-1~22.04.1 \
    make=4.3-4.1build1 \
    g++=4:11.2.0-1ubuntu1 \
    clang=1:14.0-55~exp2 \
    lib32stdc++6=12.3.0-1ubuntu1~22.04 \
    build-essential=12.9ubuntu3

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y  tzdata=2024a-0ubuntu0.22.04.1

# Install Node
ENV NVM_DIR /usr/local/.nvm
RUN mkdir -p $NVM_DIR
ENV NVM_VERSION=${NVM_VERSION}
RUN curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash \
    && . "$NVM_DIR/nvm.sh"  \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH

# Install PNPM
RUN wget -qO- https://get.pnpm.io/install.sh | PNPM_VERSION="$PNPM_VERSION" ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -
ENV PNPM_HOME "/root/.local/share/pnpm"
ENV PATH      $PNPM_HOME:$PATH
RUN pnpm env use --global $NODE_VERSION
RUN pnpm install turbo --global

# Install Gramine
RUN curl -fsSLo /usr/share/keyrings/gramine-keyring.gpg https://packages.gramineproject.io/gramine-keyring.gpg
RUN echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/gramine-keyring.gpg] https://packages.gramineproject.io/ jammy main' > /etc/apt/sources.list.d/gramine.list

RUN curl -fsSLo /etc/apt/keyrings/gramine-keyring-$(lsb_release -sc).gpg https://packages.gramineproject.io/gramine-keyring-$(lsb_release -sc).gpg
RUN echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/gramine-keyring-$(lsb_release -sc).gpg] https://packages.gramineproject.io/ $(lsb_release -sc) main" | tee /etc/apt/sources.list.d/gramine.list

RUN curl -fsSLo /usr/share/keyrings/intel-sgx-deb.key https://download.01.org/intel-sgx/sgx_repo/ubuntu/intel-sgx-deb.key
RUN echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/intel-sgx-deb.key] https://download.01.org/intel-sgx/sgx_repo/ubuntu jammy main' > /etc/apt/sources.list.d/intel-sgx.list

RUN curl -fsSLo /etc/apt/keyrings/intel-sgx-deb.asc https://download.01.org/intel-sgx/sgx_repo/ubuntu/intel-sgx-deb.key
RUN echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/intel-sgx-deb.asc] https://download.01.org/intel-sgx/sgx_repo/ubuntu $(lsb_release -sc) main"  | tee /etc/apt/sources.list.d/intel-sgx.list

RUN apt-get update

RUN apt-get install -y \
    sgx-aesm-service=2.25.100.3-jammy1 \
    libsgx-aesm-launch-plugin=2.25.100.3-jammy1 \
    libsgx-aesm-quote-ex-plugin=2.25.100.3-jammy1 \
    libsgx-aesm-ecdsa-plugin=2.25.100.3-jammy1 \
    libsgx-quote-ex=2.25.100.3-jammy1 \
    libsgx-dcap-ql=1.22.100.3-jammy1 \
    libsgx-dcap-quote-verify=1.22.100.3-jammy1 \
    libsgx-dcap-default-qpl-dev=1.22.100.3-jammy1

RUN apt-get install -y gramine=1.8
RUN gramine-sgx-gen-private-key

RUN git clone --depth 1 --branch ${ELIZA_VERSION} https://github.com/ai16z/eliza.git /opt/eliza

WORKDIR /opt/eliza
COPY ./ /opt/eliza/enclave

# Install dependencies and build the project
RUN pnpm install
RUN pnpm build
RUN pnpm prune --prod

RUN ls -lsth

# TODO: add another stage for docker here

# a seal folder
RUN mkdir -p data

WORKDIR /opt/eliza/enclave/gramine/trusted
RUN chmod +x ./update-trusted.sh
RUN ./update-trusted.sh

WORKDIR /opt/eliza/enclave/gramine

RUN cp -rf ../../package.json ./
RUN cp -rf ../../pnpm-workspace.yaml ./
RUN cp -rf ../../.npmrc ./
RUN cp -rf ../../turbo.json ./
RUN cp -rf ../../node_modules/ ./node_modules
RUN cp -rf ../../agent/ ./agent
RUN cp -rf ../../packages/ ./packages
RUN cp -rf ../../scripts/ ./scripts
RUN cp -rf ../../characters/ ./characters

RUN make SGX=1 SGX_DEV_BUILD=0 DEBUG=1 all

CMD ["gramine-sgx", "eliza", "start", "--non-interactive"]

LABEL version=$ELIZA_VERSION
