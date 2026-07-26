# Changesets

OpenGlass UI uses Changesets to coordinate the public `open-glass-ui` facade
with its `@open-glass-ui/*` implementation packages. The unscoped facade is the
only documented consumer entry; the scoped packages are published solely so
the facade's dependency graph can be installed from npm. The five packages are
a fixed Changesets group so their versions cannot drift apart.

The current manifests are staged at `0.1.0-rc.0`. Do not run a version,
publish, or tag command until the release checklist is complete, the exact npm
and GitHub names have been rechecked, and the owner has explicitly authorized
publication.
