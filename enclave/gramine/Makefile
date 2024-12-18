# ARCH LINUX
#ARCH_LIBDIR ?= /lib/$(shell $(CC) -dumpmachine)

# UBUNTU LINUX
ARCH_LIBDIR ?= /lib/x86_64-linux-gnu

# NOTE: MUST BE "RELATIVE PATH" TO TEE BINARY
ENCLAVEDIR ?= "."
SELF_EXE = /usr/local/share/pnpm/pnpm

SGX ?= 1
LOG_LEVEL ?= 0

.PHONY: all
all: eliza.manifest
ifeq ($(SGX),1)
all: eliza.manifest.sgx eliza.sig
endif

ifeq ($(LOG_LEVEL),4)
GRAMINE_LOG_LEVEL = all
else ifeq ($(LOG_LEVEL),3)
GRAMINE_LOG_LEVEL = trace
else ifeq ($(LOG_LEVEL),2)
GRAMINE_LOG_LEVEL = debug
else ifeq ($(LOG_LEVEL),1)
GRAMINE_LOG_LEVEL = warning
else
GRAMINE_LOG_LEVEL = error
endif

MANIFEST_FILE = eliza.manifest.template

eliza.manifest: $(MANIFEST_FILE)
	gramine-manifest \
		-Dlog_level=$(GRAMINE_LOG_LEVEL) \
		-Darch_libdir=$(ARCH_LIBDIR) \
		-Dself_exe=$(SELF_EXE) \
		-Denclave_dir=$(ENCLAVEDIR) \
		-Dopenai_api_key=$(OPENAI_API_KEY) \
		-Dredpill_api_key=$(REDPILL_API_KEY) \
		-Delevenlabs_xi_api_key=$(ELEVENLABS_XI_API_KEY) \
		-Delevenlabs_model_id=$(ELEVENLABS_MODEL_ID) \
		-Delevenlabs_voice_id=$(ELEVENLABS_VOICE_ID) \
		-Delevenlabs_voice_stability=$(ELEVENLABS_VOICE_STABILITY) \
		-Delevenlabs_voice_similarity_boost=$(ELEVENLABS_VOICE_SIMILARITY_BOOST) \
		-Delevenlabs_voice_style=$(ELEVENLABS_VOICE_STYLE) \
		-Delevenlabs_voice_use_speaker_boost=$(ELEVENLABS_VOICE_USE_SPEAKER_BOOST) \
		-Delevenlabs_optimize_streaming_latency=$(ELEVENLABS_OPTIMIZE_STREAMING_LATENCY) \
		-Delevenlabs_output_format=$(ELEVENLABS_OUTPUT_FORMAT) \
		-Dtwitter_dry_run=$(TWITTER_DRY_RUN) \
		-Dtwitter_username=$(TWITTER_USERNAME) \
		-Dtwitter_password=$(TWITTER_PASSWORD) \
		-Dtwitter_email=$(TWITTER_EMAIL) \
		-Dx_server_url=$(X_SERVER_URL) \
		-Dbirdeye_api_key=$(BIRDEYE_API_KEY) \
		-Dsol_address=$(SOL_ADDRESS) \
		-Dslippage=$(SLIPPAGE) \
		-Drpc_url=$(RPC_URL) \
		-Dhelius_api_key=$(HELIUS_API_KEY) \
		-Dserver_port=$(SERVER_PORT) \
		-Dwallet_secret_salt=$(WALLET_SECRET_SALT) \
		$< $@

eliza.manifest.sgx eliza.sig &: eliza.manifest
	gramine-sgx-sign -d today \
		--manifest $< \
		--output $<.sgx

ifeq ($(SGX),)
GRAMINE = gramine-direct
else
GRAMINE = gramine-sgx
endif

.PHONY: start-gramine-server
start-gramine-server: all
	SGX_AESM_ADDR=1 $(GRAMINE) eliza start #--non-interactive

.PHONY: clean
clean:
	$(RM) -rf $(ENCLAVEDIR)/*.token $(ENCLAVEDIR)/*.sig $(ENCLAVEDIR)/*.manifest.sgx $(ENCLAVEDIR)/*.manifest $(ENCLAVEDIR)/*.log

.PHONY: distclean
distclean: clean
	$(RM) -rf target/ Cargo.lock
