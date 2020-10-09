What's Borsh?
=============

Borsh is a binary serializer for security-critical projects: https://Borsh.io/

It's more efficient than JSON, too. Storing it takes less space in your smart contract, and encoding/decoding takes less CPU.

Borsh is maintained by the core NEAR team, and lots of core NEAR contracts use it.


(de)serializing Borsh requires a schema
=======================================

When you make a contract function receive or return JSON, near-api-js can use `JSON.parse` or `JSON.stringify` for you. But for Borsh, you'll need to tell it how to serialize and deserialize your data.

This directory contains such schemas, and some other Borsh helpers.
