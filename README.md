don't forget appController
don't forget to make the email unique true in both lines unique: true

considerations?

- scalabilty code and the simplicity to be extended
- configType for typo

database:
we use typeormconfig with fatory function for the app.
Later, if we need migrations → create a separate DataSource file pointing to the same config.
That way, our NestJS app and CLI scripts use the same database settings.

- It scales for multi-role systems:
  so, we have permissions -> role -> user_roles -> user

Permission logic allows:

- Flexible role combinations

- Granular action-level access

- Scalable, maintainable access control

DTO:

- I used zod validation for dto's both front-end and back-end: why? the front and back can share the same dto.
# Learn-Nest-2
