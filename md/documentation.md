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
- `/api/update-email`
- `/api/update-password`
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

The `get-key` endpoint is used in order to obtain a key for a game which can later be used to cash in for the coin reward.

##### Parameters

- `game` - The game the key is being requested for

##### Returns

Returns a JSON object containing
- `key` - The key object containing
  - `uuid` - The key identification
  - `user` - The object id of the associated with the key

### Use Key

##### Description

The `use-key` endpoint is used to cash the key in for coins which are added to the user's balance.

##### Returns
Returns a JSON object containing
- `sucess` - The success status of the request
- `newCoins` - The new coin balance of the user
- `message` - A description of the error (if applicable)

### Update Email

##### Description

The `update-email` endpoint is used in order to update a user's email.

##### Parameters

- `email` - The email to be updated to

##### Returns

- `success` - The success status of the request
- `message`

### Update Password

##### Description

The `update-password` endpoint is used to change a user's password.

##### Parameters

- `oldPassword` - The current password; used for verification
- `password` - The new password

##### Returns

- `success`
- `message`

### Forgot Password

##### Description

The `forgot-password` endpoint is used to send a link to the user's email that they can use to reset their password in case they forget.

##### Parameters

- `username`

##### Returns

- `success`
- `message`

### Reset Password

##### Description

The `reset-password` endpoint is different than the the `update-password` endpoint in that this endpoint is used it reset a password 
if forgotten.

##### Parameters

- `key` - The uuid of the key
- `password` - The new password

##### Returns

- `success`
- `message`











