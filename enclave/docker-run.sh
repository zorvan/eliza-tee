# Ensure the container is not already running
if [ "$(docker ps -q -f name=eliza-sgx)" ]; then
    echo "Container 'eliza' is already running. Stopping it first."
    docker stop eliza-sgx
    docker rm eliza-sgx
fi

# Define base directories to mount
BASE_MOUNTS=(
    "characters:/opt/eliza/characters"
    ".env:/opt/eliza/.env"
    "agent:/opt/eliza/agent"
    "docs:/opt/eliza/docs"
    "scripts:/opt/eliza/scripts"
)

# Define package directories to mount
PACKAGES=(
    "adapter-postgres"
    "adapter-sqlite"
    "adapter-sqljs"
    "adapter-supabase"
    "client-auto"
    "client-direct"
    "client-discord"
    "client-farcaster"
    "client-telegram"
    "client-twitter"
    "core"
    "plugin-bootstrap"
    "plugin-image-generation"
    "plugin-node"
    "plugin-solana"
    "plugin-evm"
    "plugin-tee"
)

# Start building the docker run command
CMD="docker run --platform linux/amd64 -p 3000:3000 --device /dev/sgx_enclave -v /var/run/aesmd/aesm.socket:/var/run/aesmd/aesm.socket -d"

# Add base mounts
for mount in "${BASE_MOUNTS[@]}"; do
    CMD="$CMD -v \"$(pwd)/$mount\""
done

# Add package mounts
for package in "${PACKAGES[@]}"; do
    CMD="$CMD -v \"$(pwd)/packages/$package/src:/opt/eliza/packages/$package/src\""
done

# Add core types mount separately (special case)
CMD="$CMD -v \"$(pwd)/packages/core/types:/opt/eliza/packages/core/types\""

# Add container name and image
CMD="$CMD --name eliza_sgx eliza-sgx"

# Execute the command
eval $CMD