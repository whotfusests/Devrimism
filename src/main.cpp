#include <QApplication>
#include <QCoreApplication>
#include <QDir>
#include <QFileInfo>
#include <QMessageBox>
#include <QUrl>

#include "mainwindow.h"

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    QCoreApplication::setApplicationName("Devrimism");
    QCoreApplication::setOrganizationName("Devrimism");
    QCoreApplication::setApplicationVersion("1.0.0");

    // ---------------------------------------------------------------
    // 1) Find the folder that contains the .exe file.
    //    Works no matter where the user installs the app.
    // ---------------------------------------------------------------
    const QString appDir = QCoreApplication::applicationDirPath();

    // ---------------------------------------------------------------
    // 2) The bundled website lives in a folder called "DevrimismWeb"
    //    right next to the .exe.
    // ---------------------------------------------------------------
    const QString websiteDir = QDir(appDir).filePath("DevrimismWeb");
    const QString indexPath  = QDir(websiteDir).filePath("index.html");

    // ---------------------------------------------------------------
    // 3) If the website is missing, show a friendly error and exit.
    //    Never crash, never show a blank window.
    // ---------------------------------------------------------------
    if (!QFileInfo::exists(indexPath)) {
        QMessageBox::critical(
            nullptr,
            QObject::tr("Devrimism - Website not found"),
            QObject::tr(
                "The bundled website could not be found.\n\n"
                "Expected file:\n%1\n\n"
                "Please make sure the \"DevrimismWeb\" folder is placed "
                "next to Devrimism.exe.").arg(QDir::toNativeSeparators(indexPath)));
        return 1;
    }

    // ---------------------------------------------------------------
    // 4) Create the window, load the local index.html, and show it.
    // ---------------------------------------------------------------
    MainWindow window;
    window.setWindowTitle("Devrimism");
    window.resize(1280, 800);
    window.loadWebsite(QUrl::fromLocalFile(indexPath));
    window.show();

    return app.exec();
}
