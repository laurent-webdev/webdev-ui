<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

// Modèles de pages : une page de doc (aperçu, code) et la page elle-même, seule, sans la doc autour
#[Route('/templates')]
final class TemplateController extends AbstractController
{
    #[Route('/dashboard', name: 'app_dashboard')]
    public function dashboard(): Response
    {
        return $this->render('templates/dashboard.html.twig');
    }

    #[Route('/dashboard/page', name: 'app_dashboard_page')]
    public function dashboardPage(): Response
    {
        return $this->render('templates/pages/dashboard.html.twig');
    }

    #[Route('/members', name: 'app_members')]
    public function members(): Response
    {
        return $this->render('templates/members.html.twig');
    }

    #[Route('/members/page', name: 'app_members_page')]
    public function membersPage(): Response
    {
        return $this->render('templates/pages/members.html.twig');
    }

    #[Route('/projects', name: 'app_projects')]
    public function projects(): Response
    {
        return $this->render('templates/projects.html.twig');
    }

    #[Route('/projects/page', name: 'app_projects_page')]
    public function projectsPage(): Response
    {
        return $this->render('templates/pages/projects.html.twig');
    }

    #[Route('/settings', name: 'app_settings')]
    public function settings(): Response
    {
        return $this->render('templates/settings.html.twig');
    }

    #[Route('/settings/page', name: 'app_settings_page')]
    public function settingsPage(): Response
    {
        return $this->render('templates/pages/settings.html.twig');
    }

    #[Route('/login', name: 'app_login')]
    public function login(): Response
    {
        return $this->render('templates/login.html.twig');
    }

    #[Route('/login/page', name: 'app_login_page')]
    public function loginPage(): Response
    {
        return $this->render('templates/pages/login.html.twig');
    }

    #[Route('/landing', name: 'app_landing')]
    public function landing(): Response
    {
        return $this->render('templates/landing.html.twig');
    }

    #[Route('/landing/page', name: 'app_landing_page')]
    public function landingPage(): Response
    {
        return $this->render('templates/pages/landing.html.twig');
    }
}
