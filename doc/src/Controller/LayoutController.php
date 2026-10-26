<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/layouts')]
final class LayoutController extends AbstractController
{
    #[Route('/container', name: 'app_container')]
    public function container(): Response
    {
        return $this->render('layouts/container.html.twig');
    }

    #[Route('/grid', name: 'app_grid')]
    public function grid(): Response
    {
        return $this->render('layouts/grid.html.twig');
    }
}
