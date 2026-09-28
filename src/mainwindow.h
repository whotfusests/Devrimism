#pragma once

#include <QMainWindow>
#include <QUrl>

class QWebEngineView;

// Main application window that hosts the QWebEngineView.
// It simply fills the whole window with the web view.
class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);

    // Loads a local HTML file (or any URL) into the embedded browser.
    void loadWebsite(const QUrl &url);

private:
    QWebEngineView *m_view = nullptr;
};
