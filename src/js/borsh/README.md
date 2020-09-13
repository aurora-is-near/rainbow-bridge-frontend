What's Borsh?
=============

Borsh is a binary serializer for security-critical projects: https://borsh.io/

It's more storage-efficient than JSON serialization, too

Borsh is maintained by the core NEAR team, and lots of core NEAR contracts use it


But Borsh isn't supported by near-api-js yet
============================================

That means that if a smart contract has an app-facing interface that receives a borsh-serialized input, or that returns borsh-serialized data, you can't use the default `Contract` class from `near-api-js` to wrap that contract function. Instead, for now, you need some extra boilerplate in that project.

This directory contains such boilerplate.
