
ARG UBUNTU_VERSION="22.04"


# compiler version is fixed for mrenclave
FROM ubuntu:${UBUNTU_VERSION}
ARG ELIZA_VERSION="v0.1.6-alpha.4"
ARG NODE_VERSION="v23.3.0"
ARG PNPM_VERSION="9.15.0"

SHELL ["/bin/bash", "-c"]
RUN rm /bin/sh && ln -s /bin/bash /bin/sh && \
    echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install Basic Packages
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
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
    build-essential=12.9ubuntu3 \
    apt-utils=2.4.13 \
    curl=7.81.0-1ubuntu1.20 \
    wget=1.21.2-2ubuntu1.1 \
    git=1:2.34.1-1ubuntu1.11 \
    tzdata=2024a-0ubuntu0.22.04.1

# Install PNPM
RUN wget -qO- https://get.pnpm.io/install.sh | PNPM_VERSION="$PNPM_VERSION" ENV="$HOME/.bashrc" SHELL="$(which bash)" bash - 

ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH=$PNPM_HOME:$PATH

RUN mv /root/.local/share/pnpm /usr/local/share/ && \
    pnpm env use --global $NODE_VERSION && \
    pnpm install turbo --global && \
# Remove Symlinks from PNPM
    mv $PNPM_HOME/node $PNPM_HOME/node_original && \
    cp $PNPM_HOME/nodejs/23.3.0/bin/node $PNPM_HOME/node && \
    mv $PNPM_HOME/nodejs_current $PNPM_HOME/nodejs_current_original && \
    mkdir $PNPM_HOME/nodejs_current && \
    cp -rf $PNPM_HOME/nodejs/23.3.0/* $PNPM_HOME/nodejs_current/ && \
# Install Gramine
    curl -fsSLo /usr/share/keyrings/gramine-keyring.gpg https://packages.gramineproject.io/gramine-keyring.gpg && \
    echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/gramine-keyring.gpg] https://packages.gramineproject.io/ jammy main' > /etc/apt/sources.list.d/gramine.list && \
    curl -fsSLo /etc/apt/keyrings/gramine-keyring-$(lsb_release -sc).gpg https://packages.gramineproject.io/gramine-keyring-$(lsb_release -sc).gpg && \
    echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/gramine-keyring-$(lsb_release -sc).gpg] https://packages.gramineproject.io/ $(lsb_release -sc) main" | tee /etc/apt/sources.list.d/gramine.list && \
    curl -fsSLo /usr/share/keyrings/intel-sgx-deb.key https://download.01.org/intel-sgx/sgx_repo/ubuntu/intel-sgx-deb.key && \
    echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/intel-sgx-deb.key] https://download.01.org/intel-sgx/sgx_repo/ubuntu jammy main' > /etc/apt/sources.list.d/intel-sgx.list && \
    curl -fsSLo /etc/apt/keyrings/intel-sgx-deb.asc https://download.01.org/intel-sgx/sgx_repo/ubuntu/intel-sgx-deb.key && \
    echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/intel-sgx-deb.asc] https://download.01.org/intel-sgx/sgx_repo/ubuntu $(lsb_release -sc) main"  | tee /etc/apt/sources.list.d/intel-sgx.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    sgx-aesm-service=2.25.100.3-jammy1 \
    libsgx-aesm-launch-plugin=2.25.100.3-jammy1 \
    libsgx-aesm-quote-ex-plugin=2.25.100.3-jammy1 \
    libsgx-aesm-ecdsa-plugin=2.25.100.3-jammy1 \
    libsgx-quote-ex=2.25.100.3-jammy1 \
    libsgx-dcap-ql=1.22.100.3-jammy1 \
    libsgx-dcap-quote-verify=1.22.100.3-jammy1 \
    libsgx-dcap-default-qpl-dev=1.22.100.3-jammy1 \
    gramine=1.8 && \
    gramine-sgx-gen-private-key && \
# Cleanup
    rm -rf /var/lib/apt/lists/* && \
# Clone Eliza Source
    git clone --depth 1 --branch ${ELIZA_VERSION} https://github.com/ai16z/eliza.git /eliza-src && \
    mkdir /enclave

COPY . /enclave

WORKDIR /eliza-src

# Preventing Symlinks
RUN pnpm config set prefer-symlinked-executables false -g && \
    echo -e "\nprefer-symlinked-executables=false" >> .npmrc && \
    echo -e "node-version=23.3.0" >> .npmrc && \
    echo -e "engine-strict=false" >> .npmrc && \
# Install dependencies and build the project
    pnpm install && pnpm build

#RUN pnpm config set symlink false -g
#RUN echo -e "symlink=false\n" >> .npmrc

#RUN pnpm prune --prod

# TODO: add another stage for docker here

WORKDIR /enclave/gramine/trusted
RUN chmod +x ./update-trusted.sh && ./update-trusted.sh

WORKDIR /enclave/gramine

RUN cp -rf /eliza-src/package.json           .               && \
    cp -rf /eliza-src/pnpm-workspace.yaml    .               && \
    cp -rf /eliza-src/.npmrc                 .               && \
    cp -rf /eliza-src/turbo.json             .               && \
    cp -rf /eliza-src/node_modules/          ./node_modules  && \
    cp -rf /eliza-src/agent/                 ./agent         && \
    cp -rf /eliza-src/packages/              ./packages      && \
    cp -rf /eliza-src/scripts/               ./scripts       && \
    cp -rf /eliza-src/characters/            ./characters    && \
    rm -rf /eliza-src && \
    make clean && \
    make SGX=1 LOG_LEVEL=0 all

CMD ["gramine-sgx", "eliza", "start", "--non-interactive"]

LABEL version=$ELIZA_VERSION
