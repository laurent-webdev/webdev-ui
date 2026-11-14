<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/components')]
final class ComponentController extends AbstractController
{
    #[Route('/accordion', name: 'app_accordion')]
    public function accordion(): Response
    {
        return $this->render('components/accordion.html.twig');
    }

    #[Route('/alert', name: 'app_alert')]
    public function alert(): Response
    {
        return $this->render('components/alert.html.twig');
    }

    #[Route('/badge', name: 'app_badge')]
    public function badge(): Response
    {
        return $this->render('components/badge.html.twig');
    }

    #[Route('/btn-close', name: 'app_btn_close')]
    public function btnClose(): Response
    {
        return $this->render('components/btn-close.html.twig');
    }

    #[Route('/button', name: 'app_button')]
    public function button(): Response
    {
        return $this->render('components/button.html.twig');
    }

    #[Route('/card', name: 'app_card')]
    public function card(): Response
    {
        return $this->render('components/card.html.twig');
    }

    #[Route('/dialog', name: 'app_dialog')]
    public function dialog(): Response
    {
        return $this->render('components/dialog.html.twig');
    }

    #[Route('/drawer', name: 'app_drawer')]
    public function drawer(): Response
    {
        return $this->render('components/drawer.html.twig');
    }

    #[Route('/dropdown', name: 'app_dropdown')]
    public function dropdown(): Response
    {
        return $this->render('components/dropdown.html.twig');
    }

    #[Route('/form', name: 'app_form')]
    public function form(): Response
    {
        return $this->render('components/form.html.twig');
    }

    #[Route('/link', name: 'app_link')]
    public function link(): Response
    {
        return $this->render('components/link.html.twig');
    }

    #[Route('/list', name: 'app_list')]
    public function list(): Response
    {
        return $this->render('components/list.html.twig');
    }

    #[Route('/navbar', name: 'app_navbar')]
    public function navbar(): Response
    {
        return $this->render('components/navbar.html.twig');
    }

    #[Route('/pagination', name: 'app_pagination')]
    public function pagination(): Response
    {
        return $this->render('components/pagination.html.twig');
    }

    #[Route('/spinner', name: 'app_spinner')]
    public function spinner(): Response
    {
        return $this->render('components/spinner.html.twig');
    }

    #[Route('/tab', name: 'app_tab')]
    public function tab(): Response
    {
        return $this->render('components/tab.html.twig');
    }

    #[Route('/table', name: 'app_table')]
    public function table(): Response
    {
        return $this->render('components/table.html.twig');
    }

    #[Route('/toast', name: 'app_toast')]
    public function toast(): Response
    {
        return $this->render('components/toast.html.twig');
    }
}
