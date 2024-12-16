#!/bin/bash

# ASSETS STRUCTURE
BASEDIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.." &> /dev/null && pwd )
SCRIPTS_PATH=$BASEDIR/scripts
GRAMINE_PATH=$BASEDIR/gramine

MACHINE_DOMAIN=$(awk -e '$2 ~ /.+\..+\..+/ {print $2}' /etc/hosts)

VERBOSITY_LEVLE=3
DEV_BUILD=${DEV_BUILD:-0}

die() {
    printf '%s\n' "$1" >&2
    exit 1
}


NC='\033[0m'			  # Reset
IRed='\033[0;91m'         # Red
IGreen='\033[0;92m'       # Green
IYellow='\033[0;93m'      # Yellow
IBlue='\033[0;94m'        # Blue
IPurple='\033[0;95m'      # Purple
ICyan='\033[0;96m'        # Cyan
IWhite='\033[0;97m'       # White
BIWhite='\033[1;97m'      # White

# Create Enclave using Makefile
cd $GRAMINE_PATH
echo -n -e "\n${BIWhite}Creating Enclave ${NC}"
make SGX=1 \
	ENCLAVE_DIR=$GRAMINE_PATH \
	SGX_VERBOSITY=$VERBOSITY_LEVLE\
	SGX_DEV_BUILD=$DEV_BUILD\
	start-gramine-server


