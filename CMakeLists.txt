cmake_minimum_required(VERSION 3.20)

project(Devrimism VERSION 1.0.0 LANGUAGES CXX)

# --- C++ standard ---------------------------------------------------------
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# --- Qt automatic tooling -------------------------------------------------
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

# --- Default to Release when the user does not pick a config --------------
if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "" FORCE)
endif()

# --- Find Qt 6 (Core, Widgets, WebEngineWidgets) --------------------------
find_package(Qt6 REQUIRED COMPONENTS Core Widgets WebEngineWidgets)

qt_standard_project_setup()

# --- The executable -------------------------------------------------------
# WIN32 -> no console window on Windows (it's a GUI application)
qt_add_executable(Devrimism WIN32
    src/main.cpp
    src/mainwindow.cpp
    src/mainwindow.h
)

target_link_libraries(Devrimism PRIVATE
    Qt6::Core
    Qt6::Widgets
    Qt6::WebEngineWidgets
)

# --- Copy the website next to the built .exe automatically ----------------
# Source folder : DevrimismWeb/
# Destination   : <build-dir>/Release/DevrimismWeb/
add_custom_command(TARGET Devrimism POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_CURRENT_SOURCE_DIR}/DevrimismWeb"
        "$<TARGET_FILE_DIR:Devrimism>/DevrimismWeb"
    COMMENT "Copying DevrimismWeb website next to the executable"
)

# --- On Windows, set the subsystem and leave the rest to Qt ----------------
if(WIN32)
    set_target_properties(Devrimism PROPERTIES
        WIN32_EXECUTABLE TRUE
    )
endif()
