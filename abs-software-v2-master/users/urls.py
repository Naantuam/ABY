from django.urls import path
from .views import (
    # User management
    UserListCreateView,
    UserDetailView,
    UserUpdateView,
    UserDeleteView,
    UserStatsView,
    CurrentUserView,
    ActivateUserView,
    CreateUserWithRoleView,
    AssignRoleView,

    # Role management
    RoleListView,
    RoleDetailView,
    RoleCreateView,

    # Employees & Permissions
    EmployeeListCreateView,
    EmployeeDetailView,
    AppPermissionsView,

    # Auth & MFA
    SignupView,
    LoginView,
    AnnouncementListCreateView,
)

urlpatterns = [
    # User endpoints
    path('', UserListCreateView.as_view(), name='user-list-create'),
    path('<int:id>/', UserDetailView.as_view(), name='user-detail'),
    path('<int:id>/update/', UserUpdateView.as_view(), name='user-update'),
    path('<int:id>/delete/', UserDeleteView.as_view(), name='user-delete'),
    path('<int:id>/assign-role/', AssignRoleView.as_view(), name='user-assign-role'),
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('activate/<uidb64>/<token>/', ActivateUserView.as_view(), name='activate-user'),
    path('create-with-role/', CreateUserWithRoleView.as_view(), name='create-user-with-role'),

    # Role endpoints
    path('roles/', RoleListView.as_view(), name='role-list'),
    path('roles/<int:id>/', RoleDetailView.as_view(), name='role-detail'),
    path('roles/create/', RoleCreateView.as_view(), name='role-create'),

    # Employees & Permissions
    path('employees/', EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('employees/<int:id>/', EmployeeDetailView.as_view(), name='employee-detail'),
    path('permissions/<str:app_label>/', AppPermissionsView.as_view(), name='app-permissions'),

    # Auth & MFA endpoints
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),

    # Announcements
    path('announcements/', AnnouncementListCreateView.as_view(), name='announcements'),
]
