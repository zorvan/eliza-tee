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
CMD="docker run \
    --platform linux/amd64 \
    -p 3000:3000 \
    --device /dev/sgx_enclave \
    -v /var/run/aesmd/aesm.socket:/var/run/aesmd/aesm.socket \
    -e OPENAI_API_KEY="" \
    -e REDPILL_API_KEY="" \
    -e ELEVENLABS_XI_API_KEY="" \
    -e ELEVENLABS_MODEL_ID=eleven_multilingual_v2 \
    -e ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM \
    -e ELEVENLABS_VOICE_STABILITY=0.5 \
    -e ELEVENLABS_VOICE_SIMILARITY_BOOST=0.9 \
    -e ELEVENLABS_VOICE_STYLE=0.66 \
    -e ELEVENLABS_VOICE_USE_SPEAKER_BOOST=false \
    -e ELEVENLABS_OPTIMIZE_STREAMING_LATENCY=4 \
    -e ELEVENLABS_OUTPUT_FORMAT=pcm_16000 \
    -e TWITTER_DRY_RUN=false \
    -e TWITTER_USERNAME="" \
    -e TWITTER_PASSWORD="" \
    -e TWITTER_EMAIL="" \
    -e X_SERVER_URL=https://api.red-pill.ai/v1 \
    -e SOL_ADDRESS=So11111111111111111111111111111111111111112 \
    -e SLIPPAGE=1 \
    -e RPC_URL=https://api.mainnet-beta.solana.com \
    -e SERVER_PORT=3000 \
    -e WALLET_SECRET_SALT=secret_salt \
    -d"

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