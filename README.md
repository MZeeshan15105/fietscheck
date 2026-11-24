# FietsCheck – Flutter version

Separate native app on the same theme as the web app (main branch).
The web app on GitHub Pages is not touched by this branch.

Only `lib/`, `assets/` and `pubspec.yaml` live in git. GitHub Actions runs
`flutter create` to add the Android files, then builds the APK.

Newest APK: https://github.com/MZeeshan15105/fietscheck/releases/download/flutter-latest/FietsCheck-flutter.apk
