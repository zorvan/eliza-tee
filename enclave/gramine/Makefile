# ARCH LINUX
#ARCH_LIBDIR ?= /lib/$(shell $(CC) -dumpmachine)

# UBUNTU LINUX
ARCH_LIBDIR ?= /lib/x86_64-linux-gnu

# NOTE: MUST BE "RELATIVE PATH" TO TEE BINARY
ENCLAVEDIR ?= "."
SELF_EXE = /root/.local/share/pnpm/pnpm

SGX ?= 1
LOG_LEVEL ?= 1
SGX_DEV_BUILD ?= 0

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

ifeq ($(SGX_DEV_BUILD),1)
MANIFEST_FILE = dev_eliza.manifest.template
else
MANIFEST_FILE = eliza.manifest.template
endif

eliza.manifest: $(MANIFEST_FILE)
	gramine-manifest \
		-Dlog_level=$(GRAMINE_LOG_LEVEL) \
		-Darch_libdir=$(ARCH_LIBDIR) \
		-Dself_exe=$(SELF_EXE) \
		-Denclave_dir=$(ENCLAVEDIR) \
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
	SGX_AESM_ADDR=1 $(GRAMINE) eliza start --non-interactive

.PHONY: clean
clean:
	$(RM) -rf $(ENCLAVEDIR)/*.token $(ENCLAVEDIR)/*.sig $(ENCLAVEDIR)/*.manifest.sgx $(ENCLAVEDIR/)*.manifest $(ENCLAVEDIR)/result-* $(ENCLAVEDIR)/*.log

.PHONY: distclean
distclean: clean
	$(RM) -rf target/ Cargo.lock
