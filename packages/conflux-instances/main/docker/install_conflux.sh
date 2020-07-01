#!/bin/bash

# f=`mktemp -d`
git clone --branch v0.5.1 --single-branch --depth 1 https://github.com/Conflux-Chain/conflux-rust

cd conflux-rust
cargo build --release
ls
# popd $f

# cp -a $f/substrate-* ~/.cargo/bin
# cp -a $f/polkadot-* ~/.cargo/bin
