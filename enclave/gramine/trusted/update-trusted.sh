mkdir -p ./etc/ssl/certs/
cp -f /etc/ssl/certs/ca-certificates.crt ./etc/ssl/certs/

mkdir -p ./arch_libdir/
cp -f /lib/x86_64-linux-gnu/libcrypto.so.3 ./arch_libdir/
cp -f /lib/x86_64-linux-gnu/libgcc_s.so.1 ./arch_libdir/
cp -f /lib/x86_64-linux-gnu/libssl.so.3 ./arch_libdir/
cp -f /lib/x86_64-linux-gnu/libstdc++.so.6 ./arch_libdir/

mkdir -p ./gramine/runtime/glibc/
cp -f /usr/lib/x86_64-linux-gnu/gramine/libsysdb.so ./gramine/
cp -frL /usr/lib/x86_64-linux-gnu/gramine/runtime/glibc/* ./gramine/runtime/glibc/

# Bash
cp -f /lib/x86_64-linux-gnu/libpcre2-8.so.0 ./arch_libdir/
cp -f /lib/x86_64-linux-gnu/libselinux.so.1 ./arch_libdir/
cp -f /lib/x86_64-linux-gnu/libtinfo.so.6 ./arch_libdir/
cp -f /usr/lib/x86_64-linux-gnu/libacl.so.1.* ./arch_libdir/libacl.so.1
