#docker system prune -f
#docker builder prune -f

read -p "Building version [v0.1.6-alpha.4] : " ver

VER=${ver:-v0.1.6-alpha.4}

#--progress=plain
#--rm --no-cache
docker build  --platform linux/amd64 \
    -t eliza-sgx:$VER \
    -t eliza-sgx:latest \
    --build-arg UBUNTU_VERSION=22.04 \
    --build-arg ELIZA_VERSION=$VER \
    .
