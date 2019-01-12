Documentation of the BlendyAPI
------------------------------

### Introduction

The [BlendyAPI](https://github.com/Cryptobyte/BlendyAPI) is a RESTFUL web service for managing 
user interactions throughout the BlendyCat arcade site.

### Endpoints

The following REST endpoints exist:
- `/api/login`
- `/api/register`
- `/api/get-key`
- `/api/use-key`
- `/api/users/:username`

## Usage

Each endpoint requires specific parameters in order to work properly.

### Login

##### Description

The login endpoint is used in order to create a session and validate user credentials.
##### Parameters

- `username`
- `password`

##### Returns

A JSON object containing the sanitized user object

### Register

##### Description

The register endpoint is used in order to create a user account.

##### Parameters

- `username`
- `email`
- `password`

##### Returns

A JSON object containing

- `success` - Whether the registration is successful
- `message` - An error message describing the error (if applicable)
- `user` - The sanitized user object

### Get Key

##### Description

The `get-key` endpoint is used in order to obtain a key for a game which can later be used to cash in for the coin reward

##### Parameters
- `game` - The game the key is being requested for

##### Returns
Returns a JSON object containing
- `key` - The key object containing
  - `uuid` - The key identification
  - `user` - The object id of the associated with the key

### Use Key

##### Description
The `use-key` endpoint is used to cash the key in for coins which are added to the user's balance

##### Returns
Returns a JSON object containing
- `sucess` - The success status of the request
- `newCoins` - The new coin balance of the user
- ``







