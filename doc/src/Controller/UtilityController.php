<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/utilities')]
final class UtilityController extends AbstractController
{
    #[Route('/animation', name: 'app_animation')]
    public function animation(): Response
    {
        return $this->render('utilities/animation.html.twig');
    }

    #[Route('/aspect-ratio', name: 'app_aspect_ratio')]
    public function aspectRatio(): Response
    {
        return $this->render('utilities/aspect-ratio.html.twig');
    }

    #[Route('/border', name: 'app_border')]
    public function border(): Response
    {
        return $this->render('utilities/border.html.twig');
    }

    #[Route('/box-shadow', name: 'app_box_shadow')]
    public function boxShadow(): Response
    {
        return $this->render('utilities/box-shadow.html.twig');
    }

    #[Route('/colors', name: 'app_colors')]
    public function colors(): Response
    {
        return $this->render('utilities/colors.html.twig');
    }

    #[Route('/cursor', name: 'app_cursor')]
    public function cursor(): Response
    {
        return $this->render('utilities/cursor.html.twig');
    }

    #[Route('/display', name: 'app_display')]
    public function display(): Response
    {
        return $this->render('utilities/display.html.twig');
    }

    #[Route('/flex', name: 'app_flex')]
    public function flex(): Response
    {
        return $this->render('utilities/flex.html.twig');
    }

    #[Route('/font', name: 'app_font')]
    public function font(): Response
    {
        return $this->render('utilities/font.html.twig');
    }

    #[Route('/gap', name: 'app_gap')]
    public function gap(): Response
    {
        return $this->render('utilities/gap.html.twig');
    }

    #[Route('/glass', name: 'app_glass')]
    public function glass(): Response
    {
        return $this->render('utilities/glass.html.twig');
    }

    #[Route('/object-fit', name: 'app_object_fit')]
    public function objectFit(): Response
    {
        return $this->render('utilities/object-fit.html.twig');
    }

    #[Route('/opacity', name: 'app_opacity')]
    public function opacity(): Response
    {
        return $this->render('utilities/opacity.html.twig');
    }

    #[Route('/overflow', name: 'app_overflow')]
    public function overflow(): Response
    {
        return $this->render('utilities/overflow.html.twig');
    }

    #[Route('/position', name: 'app_position')]
    public function position(): Response
    {
        return $this->render('utilities/position.html.twig');
    }

    #[Route('/sizing', name: 'app_sizing')]
    public function sizing(): Response
    {
        return $this->render('utilities/sizing.html.twig');
    }

    #[Route('/spacing', name: 'app_spacing')]
    public function spacing(): Response
    {
        return $this->render('utilities/spacing.html.twig');
    }

    #[Route('/text', name: 'app_text')]
    public function text(): Response
    {
        return $this->render('utilities/text.html.twig');
    }

    #[Route('/vertical-align', name: 'app_vertical_align')]
    public function verticalAlign(): Response
    {
        return $this->render('utilities/vertical-align.html.twig');
    }

    #[Route('/visibility', name: 'app_visibility')]
    public function visibility(): Response
    {
        return $this->render('utilities/visibility.html.twig');
    }

    #[Route('/visually-hidden', name: 'app_visually_hidden')]
    public function visuallyHidden(): Response
    {
        return $this->render('utilities/visually-hidden.html.twig');
    }
}
