HOST = hhsw.de@ssh.strato.de:sites/qrim/
OBJECTS = .htaccess index.html css images lib
OPTIONS = \
	--recursive \
	--times \
	--update \
	--delete-after \
	--compress

sync: $(OBJECTS)
	rsync $(OPTIONS) $^ $(HOST)
