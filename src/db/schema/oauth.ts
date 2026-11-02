import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { user, session } from './auth'

// Tables Better Auth needs for the MCP server's OAuth sign-in: the `jwt` plugin
// (`jwks`) and `@better-auth/oauth-provider` (the rest). Keys match the field
// names those plugins declare, because the Drizzle adapter looks columns up by
// key. Better Auth stores array fields as JSON strings, so they are plain text
// here. Keep in sync when upgrading Better Auth.

const ms = (name: string) => integer(name, { mode: 'timestamp_ms' })
const bool = (name: string) => integer(name, { mode: 'boolean' })

export const jwks = sqliteTable('jwks', {
  id: text('id').primaryKey(),
  publicKey: text('public_key').notNull(),
  privateKey: text('private_key').notNull(),
  createdAt: ms('created_at').notNull(),
  expiresAt: ms('expires_at'),
  alg: text('alg'),
  crv: text('crv'),
})

export const oauthClient = sqliteTable('oauth_client', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().unique(),
  clientSecret: text('client_secret'),
  clientDiscoveryId: text('client_discovery_id'),
  disabled: bool('disabled'),
  skipConsent: bool('skip_consent'),
  enableEndSession: bool('enable_end_session'),
  subjectType: text('subject_type'),
  scopes: text('scopes'),
  clientCredentialsScopes: text('client_credentials_scopes'),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  createdAt: ms('created_at'),
  updatedAt: ms('updated_at'),
  name: text('name'),
  uri: text('uri'),
  icon: text('icon'),
  contacts: text('contacts'),
  tos: text('tos'),
  policy: text('policy'),
  softwareId: text('software_id'),
  softwareVersion: text('software_version'),
  softwareStatement: text('software_statement'),
  redirectUris: text('redirect_uris').notNull(),
  postLogoutRedirectUris: text('post_logout_redirect_uris'),
  backchannelLogoutUri: text('backchannel_logout_uri'),
  backchannelLogoutSessionRequired: bool('backchannel_logout_session_required'),
  tokenEndpointAuthMethod: text('token_endpoint_auth_method'),
  applicationType: text('application_type'),
  jwks: text('jwks'),
  jwksUri: text('jwks_uri'),
  grantTypes: text('grant_types'),
  responseTypes: text('response_types'),
  requirePKCE: bool('require_pkce'),
  dpopBoundAccessTokens: bool('dpop_bound_access_tokens'),
  referenceId: text('reference_id'),
  metadata: text('metadata'),
})

export const oauthResource = sqliteTable('oauth_resource', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull().unique(),
  name: text('name').notNull(),
  accessTokenTtl: integer('access_token_ttl'),
  refreshTokenTtl: integer('refresh_token_ttl'),
  signingAlgorithm: text('signing_algorithm'),
  signingKeyId: text('signing_key_id'),
  allowedScopes: text('allowed_scopes'),
  customClaims: text('custom_claims'),
  dpopBoundAccessTokensRequired: bool('dpop_bound_access_tokens_required'),
  disabled: bool('disabled'),
  createdAt: ms('created_at'),
  updatedAt: ms('updated_at'),
  policyVersion: integer('policy_version'),
  metadata: text('metadata'),
})

export const oauthClientResource = sqliteTable(
  'oauth_client_resource',
  {
    id: text('id').primaryKey(),
    clientId: text('client_id')
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: 'cascade' }),
    resourceId: text('resource_id')
      .notNull()
      .references(() => oauthResource.identifier, { onDelete: 'cascade' }),
    metadata: text('metadata'),
    createdAt: ms('created_at'),
  },
  (t) => [uniqueIndex('oauth_client_resource_pair_idx').on(t.clientId, t.resourceId)],
)

export const oauthRefreshToken = sqliteTable(
  'oauth_refresh_token',
  {
    id: text('id').primaryKey(),
    token: text('token').notNull().unique(),
    clientId: text('client_id')
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: 'cascade' }),
    sessionId: text('session_id').references(() => session.id, { onDelete: 'set null' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    referenceId: text('reference_id'),
    authorizationCodeId: text('authorization_code_id'),
    resources: text('resources'),
    requestedUserInfoClaims: text('requested_user_info_claims'),
    expiresAt: ms('expires_at').notNull(),
    createdAt: ms('created_at').notNull(),
    revoked: ms('revoked'),
    rotatedAt: ms('rotated_at'),
    rotationReplayResponse: text('rotation_replay_response'),
    rotationReplayExpiresAt: ms('rotation_replay_expires_at'),
    authTime: ms('auth_time'),
    confirmation: text('confirmation'),
    scopes: text('scopes').notNull(),
  },
  (t) => [index('oauth_refresh_token_user_idx').on(t.userId, t.clientId)],
)

export const oauthAccessToken = sqliteTable(
  'oauth_access_token',
  {
    id: text('id').primaryKey(),
    token: text('token').notNull().unique(),
    clientId: text('client_id')
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: 'cascade' }),
    sessionId: text('session_id').references(() => session.id, { onDelete: 'set null' }),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    referenceId: text('reference_id'),
    authorizationCodeId: text('authorization_code_id'),
    resources: text('resources'),
    requestedUserInfoClaims: text('requested_user_info_claims'),
    refreshId: text('refresh_id').references(() => oauthRefreshToken.id, {
      onDelete: 'cascade',
    }),
    expiresAt: ms('expires_at').notNull(),
    createdAt: ms('created_at').notNull(),
    revoked: ms('revoked'),
    confirmation: text('confirmation'),
    scopes: text('scopes').notNull(),
  },
  (t) => [index('oauth_access_token_user_idx').on(t.userId, t.clientId)],
)

export const oauthConsent = sqliteTable(
  'oauth_consent',
  {
    id: text('id').primaryKey(),
    clientId: text('client_id')
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    referenceId: text('reference_id'),
    resources: text('resources'),
    requestedUserInfoClaims: text('requested_user_info_claims'),
    scopes: text('scopes').notNull(),
    createdAt: ms('created_at').notNull(),
    updatedAt: ms('updated_at').notNull(),
  },
  (t) => [index('oauth_consent_user_idx').on(t.userId, t.clientId)],
)

export const oauthClientAssertion = sqliteTable('oauth_client_assertion', {
  id: text('id').primaryKey(),
  expiresAt: ms('expires_at').notNull(),
})
