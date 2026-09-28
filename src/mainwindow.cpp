#include "mainwindow.h"

#include <QWebEngineView>
#include <QWebEngineSettings>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    // Create the embedded browser and make it fill the window.
    m_view = new QWebEngineView(this);
    setCentralWidget(m_view);

    // Configure the web view so that a fully local website works:
    //  - local files may load other local files (css, js, images, fonts, video)
    //  - JavaScript is enabled
    //  - images load automatically
    QWebEngineSettings *s = m_view->settings();
    s->setAttribute(QWebEngineSettings::LocalContentCanAccessFileUrls,   true);
    s->setAttribute(QWebEngineSettings::LocalContentCanAccessRemoteUrls, true);
    s->setAttribute(QWebEngineSettings::JavascriptEnabled,               true);
    s->setAttribute(QWebEngineSettings::JavascriptCanOpenWindows,        false);
    s->setAttribute(QWebEngineSettings::AutoLoadImages,                  true);
    s->setAttribute(QWebEngineSettings::PluginsEnabled,                  true);
    s->setAttribute(QWebEngineSettings::FullScreenSupportEnabled,        true);
    s->setAttribute(QWebEngineSettings::ScrollAnimatorEnabled,           true);
}

void MainWindow::loadWebsite(const QUrl &url)
{
    m_view->load(url);
}
