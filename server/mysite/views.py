# views.py
import os
from django.http import HttpResponse, Http404
from django.conf import settings
import mimetypes
from django.http import FileResponse


def serve_upload(request, file_path):

    # Build safe file path
    full_path = os.path.join(settings.MEDIA_ROOT, file_path)

    # Security check
    if not os.path.exists(full_path):
        raise Http404("File not found")

    # Serve the file
    content_type, _ = mimetypes.guess_type(full_path)
    if not content_type:
        content_type = "application/vnd.android.package-archive"

    return FileResponse(open(full_path, "rb"), content_type=content_type)
